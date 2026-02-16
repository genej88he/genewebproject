import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Workspace.css';

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

  const handleConfirm = () => {
    if (editingId) {
      setSeeds(seeds.map(s => s.id === editingId ? { ...s, text: currentInput, content: currentContent, type: selectedType} : s));
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
      setSeeds([...seeds, newSeed]);
      setIsModalOpen(false);
      
      if (selectedType !== 'folder') {
        navigate(getPath(selectedType, newId));
      }
    }
  };

  const handleDelete = () => {
    if (editingId) {
      const updated = seeds.filter(s => s.id !== editingId);
      setSeeds(updated);
      setIsModalOpen(false);
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

  const currentItems = seeds.filter(s => s.folderId === openFolderId);
  const currentFolder = openFolderId ? seeds.find(s => s.id === openFolderId) : null;

  return (
    <div className="workspace-container">
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
                <div className="file-name">{seed.text}</div>
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
  );
};

export default Workspace;