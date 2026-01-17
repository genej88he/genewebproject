import React, {useState, useEffect} from 'react';
import './Textdoc.css';
import { useNavigate, useParams } from 'react-router-dom';

const TextDoc = ({seeds, setSeeds}) => {
  const navigate = useNavigate();
  const { seedId } = useParams();

  const currentSeed = seeds.find(s => s.id === seedId);

  const [title, setTitle] = useState(currentSeed?.text || "");
  const [content, setContent] = useState(currentSeed?.content || "");

  useEffect(() => {
    setSeeds(prevSeeds => 
        prevSeeds.map(s => 
          s.id === seedId ? { ...s, text: title, content: content } : s
        )
      );
  }, [title, content, seedId, setSeeds]); // This effect runs whenever you type

  // Error handling if the user types a random ID in the URL
  if (!currentSeed) {
    return <div className="error-msg">Seed not found!</div>;
  }

  return (
    <div className="doc-container">
      {/* 1. TOP TOOLBAR */}
      <header className="doc-toolbar">
        <div className="toolbar-left">
          <button onClick={() => navigate('/workspace')} className="tool-btn">
            ✕ Close
          </button>
          <div className="undo-redo">
            <button className="tool-btn">↶</button>
            <button className="tool-btn">↷</button>
          </div>
        </div>

        <div className="toolbar-center">
          <button className="tool-btn">Aa</button>
          <button className="tool-btn">田</button>
          <button className="tool-btn">🖼️</button>
          <button className="tool-btn">🎤</button>
        </div>

        <div className="toolbar-right">
          <button className="tool-btn">📤</button>
          <button className="tool-btn">⋯</button>
        </div>
      </header>

      {/* 2. WRITING AREA */}
      <main className="doc-body">
        <input 
          type="text" 
          className="doc-title-input" 
          placeholder="Untitled" 
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Connects typing to state
        />
        <textarea 
          className="doc-content-area" 
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)} // Connects typing to state
        />
      </main>
    </div>
  );
};

export default TextDoc;