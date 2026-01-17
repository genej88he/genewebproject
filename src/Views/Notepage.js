import React, {useState, useEffect} from 'react';
import './Notepage.css';
import { useParams, useNavigate } from 'react-router-dom';

const Notepage = ({ seeds, setSeeds }) => {
    const { seedId } = useParams();
    const navigate = useNavigate();
    const currentSeed = seeds.find(s => s.id === seedId);
    // 1. Use local state for the "typing" experience
    const [content, setContent] = useState(currentSeed?.content || "");

    useEffect(() => {
        setSeeds(prevSeeds => 
            prevSeeds.map(s => s.id === seedId ? { ...s, content: content } : s)
        );
    }, [content, seedId, setSeeds]);
  
    if (!currentSeed) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Note not found!</h2>
                <button onClick={() => navigate('/workspace')}>Return to Workspace</button>
            </div>
        );
    }
  
    return (
      <div className="notepage-container" style={{ padding: '40px', backgroundColor: '#fffbe6', minHeight: '100vh' }}>
        <button onClick={() => navigate('/workspace')}>← Back to Workspace</button>
        
        <h1 style={{ marginTop: '20px' }}>{currentSeed.text}</h1>
        
        <textarea 
          style={{ width: '100%', height: '400px', marginTop: '20px', padding: '15px', fontSize: '18px' }}
          placeholder="Write your notes here..."
          value={content} 
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    );
  };
  
  export default Notepage;