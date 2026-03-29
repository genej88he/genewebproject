import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Workspace.css';
import Sidebar from './Sidebar.js'
import docImg from '../assets/images/orangedoc.png';
import folderImg from '../assets/images/mangofile.png'

const Workspace = ({seeds, setSeeds}) => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentContent, setCurrentContent] = useState("");
  const [selectedType, setSelectedType] = useState('doc');
  const [openFolderId, setOpenFolderId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailySessions, setDailySessions] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      if (window.electronAPI?.getDailySessions) {
        const sessions = await window.electronAPI.getDailySessions();
        setDailySessions(sessions);
        const total = sessions.reduce((sum, s) => sum + s.duration_ms, 0);
        setTotalHours((total / 3600000).toFixed(1));
      }
    }
    loadSessions();
  }, []);

  useEffect(() => {
    async function loadStats() {
      if (window.electronAPI?.getStats) {
        const s = await window.electronAPI.getStats();
        setStats(s);
      }
    }
    loadStats();
  }, []);

  const getPath = (type, id) => {
    const pathMap = { 'notebook': `/note/${id}`, 'doc': `/doc/${id}` };
    return pathMap[type] || `/doc/${id}`;
  };

  const openAddModal = (type = 'doc') => {
    setEditingId(null);
    setCurrentInput("");
    setIsModalOpen(true);
    setCurrentContent("");
    setSelectedType(type);
  };

  const openRenameModal = (id) => {
    const selectedSeed = seeds.find(s => s.id === id);
    if (selectedSeed) {
      setEditingId(id);
      setCurrentInput(selectedSeed.text);
      setIsModalOpen(true);
      setCurrentContent(selectedSeed.content || "");
      setSelectedType(selectedSeed.type || "doc");
    }
  };

  const handleConfirm = async () => {
    if (editingId) {
      await window.electronAPI.updateNote(editingId, { text: currentInput, content: currentContent });
      const notes = await window.electronAPI.getAllNotes();
      setSeeds(notes);
      setIsModalOpen(false);
    } else {
      const newId = uuidv4();
      const newSeed = {
        id: newId,
        text: currentInput || 'Untitled',
        content: currentContent,
        type: selectedType,
        folderId: openFolderId,
        createdAt: Date.now()
      };
      setSeeds(prev => [...prev, newSeed]);
      window.electronAPI.createNote(newSeed);
      setIsModalOpen(false);
      if (selectedType !== 'folder') navigate(getPath(selectedType, newId));
    }
  };

  const handleDelete = async () => {
    if (editingId) {
      await window.electronAPI.deleteNote(editingId);
      setSeeds(prev => prev.filter(s => s.id !== editingId));
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  const handleDoubleClick = (seed) => {
    if (seed.type === 'folder') setOpenFolderId(seed.id);
    else navigate(getPath(seed.type, seed.id));
  };

  const handleDragStart = (e, seedId) => e.dataTransfer.setData('seedId', seedId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDropOnFolder = (e, folderId) => {
    e.preventDefault();
    const seedId = e.dataTransfer.getData('seedId');
    if (seedId && seedId !== folderId) {
      setSeeds(seeds.map(s => s.id === seedId ? { ...s, folderId } : s));
    }
  };

  const currentItems = seeds.filter(s => s.folderId === openFolderId);
  const currentFolder = openFolderId ? seeds.find(s => s.id === openFolderId) : null;
  const recentFiles = [...seeds]
    .filter(s => s.type !== 'folder')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3);
  const filteredItems = searchQuery.trim()
    ? seeds.filter(s => s.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentItems;
  const isSearching = searchQuery.trim().length > 0;
  const maxDuration = Math.max(...dailySessions.map(s => s.duration_ms), 1);

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
      <div className="workspace-container" style={{ marginLeft: isCollapsed ? '72px' : '220px' }}>
        <div className="workspace-scroll">

          {/* ── HEADER ── */}
          <div className={`ws-header ${openFolderId ? 'ws-header--folder' : ''}`}>
            {openFolderId ? (
              <>
                <button onClick={() => setOpenFolderId(null)} className="back-btn">← Back</button>
                <h1 className="ws-folder-title">{currentFolder?.text}</h1>
              </>
            ) : (
              <div>
                <div className="ws-eyebrow">Your workspace</div>
                <h1 className="ws-title">Welcome to your <em>Mango Seed</em> Workspace</h1>
                <p className="ws-subtitle">Organize your study materials and generate hyper-focused assessments.</p>
              </div>
            )}
          </div>

          {/* ── SEARCH ── */}
          {!openFolderId && (
            <div className="ws-search-wrap">
              <span className="ws-search-icon">⌕</span>
              <input
                className="ws-search"
                placeholder="Search files, folders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* ── FOLDER VIEW ── */}
          {openFolderId && !isSearching && (
            <div className="ws-folder-view">
              <div className="ws-section-header">
                <span className="ws-section-title">Contents</span>
                <button className="ws-add-btn" onClick={() => openAddModal('doc')}>+ Add</button>
              </div>
              <div className="canvas-wrapper canvas-wrapper--full">
                <div className="file-grid">
                  {currentItems
                    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
                    .map((seed) => (
                      <div
                        key={seed.id}
                        className="file-item"
                        draggable={seed.type !== 'folder'}
                        onDragStart={(e) => handleDragStart(e, seed.id)}
                        onDragOver={seed.type === 'folder' ? handleDragOver : undefined}
                        onDrop={seed.type === 'folder' ? (e) => handleDropOnFolder(e, seed.id) : undefined}
                        onClick={() => handleDoubleClick(seed)}
                        onContextMenu={(e) => { e.preventDefault(); openRenameModal(seed.id); }}
                      >
                        <div className="file-icon-wrapper">
                          {seed.type === 'folder'
                            ? <img src={folderImg} alt="folder" className="folder-icon" />
                            : <img src={docImg} alt="file" className="file-icon-img" />}
                        </div>
                        <div className="file-name">{seed.text || 'Untitled'}</div>
                      </div>
                    ))}
                  {currentItems.length === 0 && (
                    <div className="ws-empty">No files in this folder yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DASHBOARD BENTO ── */}
          {!openFolderId && !isSearching && (
            <div className="ws-bento">

              {/* LEFT */}
              <div className="ws-bento-main">
                <div className="ws-quick-actions">
                  <button className="ws-action-card" onClick={() => openAddModal('folder')}>
                    <div className="ws-action-icon ws-action-icon--folder">
                      <img src={folderImg} alt="folder" style={{width: 28, height: 28}} />
                    </div>
                    <div>
                      <div className="ws-action-label">New Folder</div>
                      <div className="ws-action-sub">Organize your notes</div>
                    </div>
                  </button>
                  <button className="ws-action-card" onClick={() => openAddModal('doc')}>
                    <div className="ws-action-icon ws-action-icon--doc">
                      <img src={docImg} alt="file" style={{width: 28, height: 28}} />
                    </div>
                    <div>
                      <div className="ws-action-label">Add File</div>
                      <div className="ws-action-sub">Start a new note</div>
                    </div>
                  </button>
                </div>

                {recentFiles.length > 0 && (
                  <div className="ws-section">
                    <div className="ws-section-header">
                      <span className="ws-section-title">Recent Curations</span>
                      <span className="ws-section-count">{seeds.filter(s => s.type !== 'folder').length} files total</span>
                    </div>
                    <div className="ws-recent-grid">
                      {recentFiles.map(file => (
                        <div
                          key={file.id}
                          className="ws-recent-card"
                          onClick={() => handleDoubleClick(file)}
                          onContextMenu={e => { e.preventDefault(); openRenameModal(file.id); }}
                        >
                          <div className="ws-recent-card-top">
                            <div className="ws-recent-icon">
                              <img src={file.type === 'folder' ? folderImg : docImg} alt="file" style={{width: 28, height: 28}} />
                            </div>
                            <div className="ws-recent-badge">{file.type === 'notebook' ? 'Notebook' : 'Text Doc'}</div>
                          </div>
                          <div className="ws-recent-name">{file.text || 'Untitled'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ws-section">
                  <div className="ws-section-header">
                    <span className="ws-section-title">All Files</span>
                    <button className="ws-add-btn" onClick={() => openAddModal('doc')}>+ Add</button>
                  </div>
                  <div className="canvas-wrapper">
                    <div className="file-grid">
                      {currentItems
                        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
                        .map((seed) => (
                          <div
                            key={seed.id}
                            className="file-item"
                            draggable={seed.type !== 'folder'}
                            onDragStart={(e) => handleDragStart(e, seed.id)}
                            onDragOver={seed.type === 'folder' ? handleDragOver : undefined}
                            onDrop={seed.type === 'folder' ? (e) => handleDropOnFolder(e, seed.id) : undefined}
                            onClick={() => handleDoubleClick(seed)}
                            onContextMenu={(e) => { e.preventDefault(); openRenameModal(seed.id); }}
                          >
                            <div className="file-icon-wrapper">
                              {seed.type === 'folder'
                                ? <img src={folderImg} alt="folder" className="folder-icon" />
                                : <img src={docImg} alt="file" className="file-icon-img" />}
                            </div>
                            <div className="file-name">{seed.text || 'Untitled'}</div>
                          </div>
                        ))}
                      {currentItems.length === 0 && (
                        <div className="ws-empty">No files here yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="ws-bento-side">
                <div className="ws-activity-card">
                  <div className="ws-activity-title">Weekly Activity</div>
                  <div className="ws-chart">
                    {dailySessions.map((session, i) => {
                      const heightPct = maxDuration > 0 ? (session.duration_ms / maxDuration) * 100 : 0;
                      const isToday = i === dailySessions.length - 1;
                      return (
                        <div key={session.date} className="ws-chart-col">
                          <div className="ws-chart-bar-wrap">
                            <div
                              className={`ws-chart-bar ${isToday ? 'ws-chart-bar--today' : ''} ${heightPct > 0 ? 'ws-chart-bar--active' : ''}`}
                              style={{ height: `${Math.max(heightPct, 4)}%` }}
                              title={`${(session.duration_ms / 60000).toFixed(0)} min`}
                            />
                          </div>
                          <div className="ws-chart-label">{session.day}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="ws-activity-footer">
                    <span>Focus Sessions</span>
                    <span className="ws-activity-total">{totalHours} hrs</span>
                  </div>
                </div>

                <div className="ws-stats-card">
                  <div className="ws-stats-title">Quick Stats</div>
                  <div className="ws-stats-list">
                    <div className="ws-stat-row">
                      <span className="ws-stat-label">Total Files</span>
                      <span className="ws-stat-val">{seeds.filter(s => s.type !== 'folder').length}</span>
                    </div>
                    <div className="ws-stat-row">
                      <span className="ws-stat-label">Folders</span>
                      <span className="ws-stat-val">{seeds.filter(s => s.type === 'folder').length}</span>
                    </div>
                    <div className="ws-stat-row">
                      <span className="ws-stat-label">This week</span>
                      <span className="ws-stat-val">{dailySessions.filter(s => s.duration_ms > 0).length} days</span>
                    </div>
                  </div>
                </div>

                <div className="ws-streak-card">
                  <div className="ws-stats-title">Current Streak</div>
                  <div className="ws-streak-content">
                    <div className="ws-streak-num">{stats?.streak || 0}</div>
                    <div className="ws-streak-label">days</div>
                  </div>
                  <div className="ws-streak-bar-wrap">
                    <div className="ws-streak-bar" style={{ width: `${Math.min((stats?.streak || 0) / 30 * 100, 100)}%` }} />
                  </div>
                  <div className="ws-streak-sub">Goal: 30 day streak</div>
                </div>
              </div>
            </div>
          )}

          {/* ── SEARCH RESULTS ── */}
          {isSearching && (
            <div className="ws-section">
              <div className="ws-section-header">
                <span className="ws-section-title">Results for "{searchQuery}"</span>
              </div>
              <div className="canvas-wrapper canvas-wrapper--full">
                <div className="file-grid">
                  {filteredItems.map((seed) => (
                    <div
                      key={seed.id}
                      className="file-item"
                      onClick={() => handleDoubleClick(seed)}
                      onContextMenu={(e) => { e.preventDefault(); openRenameModal(seed.id); }}
                    >
                      <div className="file-icon-wrapper">
                        {seed.type === 'folder'
                          ? <img src={folderImg} alt="folder" className="folder-icon" />
                          : <img src={docImg} alt="file" className="file-icon-img" />}
                      </div>
                      <div className="file-name">{seed.text || 'Untitled'}</div>
                    </div>
                  ))}
                  {filteredItems.length === 0 && <div className="ws-empty">No files match your search.</div>}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── MODAL ── */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editingId ? "Rename" : `New ${selectedType === 'folder' ? 'Folder' : 'File'}`}</h3>
              {!editingId && selectedType !== 'folder' && (
                <div className="type-selector">
                  <button className={`type-btn ${selectedType === 'doc' ? 'active' : ''}`} onClick={() => setSelectedType('doc')}>Text Doc</button>
                  <button className={`type-btn ${selectedType === 'notebook' ? 'active' : ''}`} onClick={() => setSelectedType('notebook')}>Notebook</button>
                </div>
              )}
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder={selectedType === 'folder' ? "Folder name" : "File name"}
                autoFocus
              />
              <div className="modal-actions">
                <div className="left-actions">
                  {editingId && <button className="delete-btn" onClick={handleDelete}>Delete</button>}
                </div>
                <div className="right-actions">
                  <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button className="confirm-btn" onClick={handleConfirm}>{editingId ? "Save" : "Create & Open"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Workspace;