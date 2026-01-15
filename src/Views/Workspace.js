import React, { useState } from 'react';
import { Stage, Layer, Image, Text, Group } from 'react-konva';
import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';
import useImage from 'use-image';
import Header from './Header.js';
import './Workspace.css';

import docImg from '../assets/images/orangedoc.png';

const MangoSeed = ({ seed, onDragEnd, onDblClick }) => {
  // 2. This hook handles the loading logic for Konva
  const [image] = useImage(docImg); 

  return (
    <Group 
      x={seed.x} 
      y={seed.y} 
      draggable 
      onDragEnd={onDragEnd}
      onDblClick={onDblClick}
    >
      <Image
        image={image}
        width={80}  
        height={80}
        offsetX={40} 
        offsetY={40}
        shadowBlur={10}
        shadowOpacity={0.1}
      />
      <Text 
        text={seed.text} 
        x={-50} 
        y={35} 
        width={100}
        align="center"
        fontSize={14} 
        fontFamily="sans-serif"
        fill="#333" 
      />
    </Group>
  );
};

const Workspace = ({seeds, setSeeds}) => {
  // State to hold our collection of seeds

  const navigate = useNavigate();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentContent, setCurrentContent] = useState("");

  const openAddModal = () => {
    setEditingId(null);
    setCurrentInput("");
    setIsModalOpen(true);
    setCurrentContent("");
  };

  const openRenameModal = (id, text) => {
    const selectedSeed = seeds.find(s => s.id === id);
    if (selectedSeed) {
      setEditingId(id);
      setCurrentInput(selectedSeed.text);
      setIsModalOpen(true);
      setCurrentContent(selectedSeed.content || "");
    }   
  };

  const handleConfirm = () => {
    if (editingId) {
      setSeeds(seeds.map(s => s.id === editingId ? { ...s, text: currentInput, content: currentContent } : s));
      setIsModalOpen(false);
    } else {
      const newId = uuidv4();
      const newSeed = {
        id: newId,
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 100,
        text: currentInput || 'Untitled',
        content: currentContent
      };
      setSeeds([...seeds, newSeed]);
      setIsModalOpen(false);
      navigate(`/note/${newId}`);
    }
  };

  // Function to create a new seed
  // const addFile = () => {
  //   const name = window.prompt("Enter file name: ", "New File");

  //   if(name != null) {
  //     const newSeed = {
  //       id: uuidv4(),
  //       x: 150 + Math.random() * 200, // Random placement so they don't stack
  //       y: 150 + Math.random() * 200,
  //       text: 'Untitled'
  //     };
  //     setSeeds([...seeds, newSeed]);
  //   };
  // }

  // const renameFile = (id) => {
  //   const currentFile = seeds.find(s => s.id === id);
  //   const newName = window.prompt("Rename seed:", currentFile.text);
    
  //   if (newName) {
  //     setSeeds(seeds.map(s => s.id === id ? { ...s, text: newName } : s));
  //   }
  // };


    

  return (
    <div className="workspace-container">
      <Header />
      
      {/* Control Bar: Title + Button */}
      <div className="workspace-controls">
        <h2 className="welcome-text">Welcome to your Mango Seed Workspace</h2>
        <button className="add-seed-btn" onClick={openAddModal}>
          + Add File
        </button>
      </div>

      <div className="canvas-wrapper">
        {/* We subtract 150px to account for Header + Control Bar height */}
        <Stage width={window.innerWidth} height={window.innerHeight - 150}>
          <Layer>
            {seeds.map((seed) => (
              <MangoSeed 
              key={seed.id} 
              seed={seed} 
              onDragEnd={(e) => {
                const updated = seeds.map(s => 
                  s.id === seed.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                );
                setSeeds(updated);
              }} 
              onClick={() => openRenameModal(seed.id)}
              onDblClick = {() => navigate(`/note/${seed.id}`)}
            />
            ))}
          </Layer>
        </Stage>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? "Rename Seed" : "New File Name"}</h3>
            <input 
              type="text" 
              value={currentInput} 
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoFocus
            />
            {/* <textarea 
              className="note-body-textarea"
              placeholder="Start typing your lecture notes here..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
            /> */}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleConfirm}>{editingId ? "Save Name" : "Create & Open"}</button>
            </div>
          </div>
        </div>
      )}






    </div>
  );
};

export default Workspace;