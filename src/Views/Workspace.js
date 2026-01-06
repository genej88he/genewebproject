import React, { useState } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import Header from './Header.js';
import './Workspace.css';

const Workspace = () => {
  // State to hold our collection of seeds
  const [seeds, setSeeds] = useState([
    { id: uuidv4(), x: 200, y: 200, text: 'Lecture Notes' }
  ]);

  // Function to create a new seed
  const addSeed = () => {
    const newSeed = {
      id: uuidv4(),
      x: 150 + Math.random() * 200, // Random placement so they don't stack
      y: 150 + Math.random() * 200,
      text: 'New Seed'
    };
    setSeeds([...seeds, newSeed]);
  };

  return (
    <div className="workspace-container">
      <Header />
      
      {/* Control Bar: Title + Button */}
      <div className="workspace-controls">
        <h2 className="welcome-text">Welcome to your Mango Seed Workspace</h2>
        <button className="add-seed-btn" onClick={addSeed}>
          + Add Seed
        </button>
      </div>

      <div className="canvas-wrapper">
        {/* We subtract 150px to account for Header + Control Bar height */}
        <Stage width={window.innerWidth} height={window.innerHeight - 150}>
          <Layer>
            {seeds.map((seed) => (
              <Group 
                key={seed.id} 
                x={seed.x} 
                y={seed.y} 
                draggable
                onDragEnd={(e) => {
                  // Keep the seed in its new position when dropped
                  const updatedSeeds = seeds.map(s => 
                    s.id === seed.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                  );
                  setSeeds(updatedSeeds);
                }}
              >
                <Circle 
                  radius={40} 
                  fill="#ffb74d" 
                  stroke="#ffa726"
                  strokeWidth={2}
                  shadowBlur={10}
                  shadowOpacity={0.2}
                />
                <Text 
                  text={seed.text} 
                  x={-35} 
                  y={50} 
                  fontSize={14} 
                  fontFamily="sans-serif"
                  fill="#333" 
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
      <div className="workspace-hint">Drag seeds to organize your thoughts</div>
    </div>
  );
};

export default Workspace;