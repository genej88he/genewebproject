import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Workspace.css';
import Sidebar from './Sidebar.js'

import docImg from '../assets/images/orangedoc.png';
import folderImg from '../assets/images/mangofile.png'
// import notebookImg from '../assets/images/orangenotebook.png'

const Workspace = ({seeds, setSeeds}) => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentContent, setCurrentContent] = useState("");
  const [selectedType, setSelectedType] = useState('doc');
  const [openFolderId, setOpenFolderId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFileTree, setShowFileTree] = useState(false);

  const getPath = (type, id) => {
    const pathMap = {
      'notebook': `/note/${id}`,
      'doc': `/doc/${id}`,
    };
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

  const handleConfirm = async () => {  // ADD async
    if (editingId) {
      // UPDATE existing note
      await window.electronAPI.updateNote(editingId, {
        text: currentInput,
        content: currentContent
      });
      
      // Reload from database
      const notes = await window.electronAPI.getAllNotes();
      setSeeds(notes);
      setIsModalOpen(false);
    } else {
      // CREATE new note
      const newId = uuidv4();
      const newSeed = {
        id: newId,
        text: currentInput || 'Untitled',
        content: currentContent,
        type: selectedType,
        folderId: openFolderId,
        createdAt: Date.now()
      };
      
      await window.electronAPI.createNote(newSeed);
      
      // Reload from database
      const notes = await window.electronAPI.getAllNotes();
      setSeeds(notes);
      setIsModalOpen(false);
      
      if (selectedType !== 'folder') {
        navigate(getPath(selectedType, newId));
      }
    }
  };

  const handleDelete = async () => {  // ADD async
    if (editingId) {
      await window.electronAPI.deleteNote(editingId);
      
      // Reload from database
      const notes = await window.electronAPI.getAllNotes();
      setSeeds(notes);
      setIsModalOpen(false);
      setEditingId(null);
    }
  };

  const handleDoubleClick = (seed) => {
    if (seed.type === 'folder') {
      setOpenFolderId(seed.id);
    } else {
      navigate(getPath(seed.type, seed.id));
    }
  };

  const handleBackToRoot = () => {
    setOpenFolderId(null);
  };

  const handleDragStart = (e, seedId) => {
    e.dataTransfer.setData('seedId', seedId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnFolder = (e, folderId) => {
    e.preventDefault();
    const seedId = e.dataTransfer.getData('seedId');
    
    if (seedId && seedId !== folderId) {
      setSeeds(seeds.map(s => 
        s.id === seedId ? { ...s, folderId: folderId } : s
      ));
    }
  };

  // Get folder structure
  const getFolderStructure = () => {
    const rootItems = seeds.filter(s => !s.folderId);
    return rootItems;
  };

  const getItemsInFolder = (folderId) => {
    return seeds.filter(s => s.folderId === folderId);
  };

  // Handle right-click on tree item
  const handleTreeItemRightClick = (e, seedId) => {
    e.preventDefault();
    e.stopPropagation();
    openRenameModal(seedId);
  };

  const currentItems = seeds.filter(s => s.folderId === openFolderId);
  const currentFolder = openFolderId ? seeds.find(s => s.id === openFolderId) : null;

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
      <div className="workspace-container" style={{ marginLeft: isCollapsed ? '70px' : '240px' }}>
        <div className="workspace-controls">
          <div className="breadcrumb">
            {openFolderId && (
              <button onClick={handleBackToRoot} className="back-btn">
                ← Back
              </button>
            )}
            <h2 className="welcome-text">
              {openFolderId ? currentFolder?.text : 'Welcome to your Mango Seed Workspace'}
            </h2>
          </div>
          <div className="action-buttons">
            <button className="add-seed-btn" onClick={() => openAddModal('folder')}>
              + New Folder
            </button>
            <button className="add-seed-btn" onClick={() => openAddModal('doc')}>
              + Add File
            </button>
          </div>
        </div>

                {/* File Tree Dropdown */}
        <div className="file-tree-section">
          <button 
            className="tree-toggle-btn"
            onClick={() => setShowFileTree(!showFileTree)}
          >
            {showFileTree ? '▼' : '▶'} All Files ({seeds.length})
          </button>

          {showFileTree && (
            <div className="file-tree">
              {getFolderStructure().length === 0 ? (
                <div className="tree-empty">No files yet</div>
              ) : (
                getFolderStructure()
                  .sort((a, b) => {
                    // Folders first, then by creation date
                    if (a.type === 'folder' && b.type !== 'folder') return -1;
                    if (a.type !== 'folder' && b.type === 'folder') return 1;
                    return (b.createdAt || 0) - (a.createdAt || 0);
                  })
                  .map((item) => (
                    <div key={item.id} className="tree-section">
                      {/* Root level item */}
                      <div 
                        className={`tree-item ${item.type === 'folder' ? 'folder' : 'file'}`}
                        onClick={() => handleDoubleClick(item)}
                        onContextMenu={(e) => handleTreeItemRightClick(e, item.id)}
                      >
                        <span className="tree-icon">
                          {item.type === 'folder' ? <img src={folderImg} alt="folder" className="dropdown-icons" /> : 
                          item.type === 'notebook' ? '📓' : <img src={docImg} alt="file" className="dropdown-icons"/>}
                        </span>
                        <span className="tree-name">{item.text}</span>
                        {item.type === 'folder' && (
                          <span className="tree-count">
                            ({getItemsInFolder(item.id).length})
                          </span>
                        )}
                      </div>

                      {/* Items inside folder */}
                      {item.type === 'folder' && getItemsInFolder(item.id).length > 0 && (
                        <div className="tree-children">
                          {getItemsInFolder(item.id)
                            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                            .map((child) => (
                              <div
                                key={child.id}
                                className="tree-item child"
                                onClick={() => handleDoubleClick(child)}
                                onContextMenu={(e) => handleTreeItemRightClick(e, child.id)}
                              >
                                <span className="tree-icon">
                                  {child.type === 'notebook' ? '📓' :<img src={docImg} alt="file" className="dropdown-icons"/>}
                                </span>
                                <span className="tree-name">{child.text}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
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
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openRenameModal(seed.id);
                  }}
                >
                  <div className="file-icon-wrapper">
                    {seed.type === 'folder' ? (
                      <img src={folderImg} alt="folder" className="folder-icon" />
                    ) : (
                      <img src={docImg} alt="file" className="file-icon-img" />
                    )}
                  </div>
                  <div className="file-name">{seed.text || 'Untitled'}</div>
                </div>
              ))}
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>{editingId ? "Rename Seed" : `New ${selectedType === 'folder' ? 'Folder' : 'File'}`}</h3>
              
              {!editingId && selectedType !== 'folder' && (
                <div className="type-selector">
                  <button 
                    className={`type-btn ${selectedType === 'doc' ? 'active' : ''}`}
                    onClick={() => setSelectedType('doc')}
                  >
                    Text Doc
                  </button>
                  <button 
                    className={`type-btn ${selectedType === 'notebook' ? 'active' : ''}`}
                    onClick={() => setSelectedType('notebook')}
                  >
                    Notebook
                  </button>
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
                  {editingId && (
                    <button className="delete-btn" onClick={handleDelete}>
                      Delete
                    </button>
                  )}
                </div>
                <div className="right-actions">
                  <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button className="confirm-btn" onClick={handleConfirm}>
                    {editingId ? "Save Changes" : "Create & Open"}
                  </button>
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