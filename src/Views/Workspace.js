import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Header from './Header.js';
import './Workspace.css';

const Workspace = () => {
  return (
    <div className="workspace-container">
        <Header />
        <div className="canvas-wrapper">
            <Stage width={window.innerWidth} height={window.innerHeight - 80}>
                <Layer>
                    <Text text="Welcome to your Mango Seed Workspace" x={50} y={50} fontSize={24} />
                    <Rect
                        x={50}
                        y={100}
                        width={100}
                        height={100}
                        fill="#fff3e0"
                        shadowBlur={10}
                        draggable
                    />
                </Layer>
            </Stage>
        </div>
    </div>
  );
};

export default Workspace;