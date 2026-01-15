import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Notepage = ({ seeds, setSeeds }) => {
    const { seedId } = useParams(); // Gets the ID from the URL
    const navigate = useNavigate();
  
    // Find the specific seed data from the master list
    const currentSeed = seeds.find(s => s.id === seedId);
  
    const handleTextChange = (e) => {
      setSeeds(seeds.map(s => 
        s.id === seedId ? { ...s, content: e.target.value } : s
      ));
    };
  
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
          value={currentSeed.content}
          onChange={handleTextChange}
        />
      </div>
    );
  };
  
  export default Notepage;