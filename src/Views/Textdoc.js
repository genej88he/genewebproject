import React, {useState, useEffect, useRef} from 'react';
import './Textdoc.css';
import { useNavigate, useParams } from 'react-router-dom';

const FONTS = [
  { label: 'Arial (Default)', value: 'inherit' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Courier New, monospace' },
  { label: 'Sans-serif', value: 'Arial, sans-serif' },
  { label: 'Handwriting', value: 'Segoe Script, cursive' },
  { label: "Times New Roman", value: 'Times New Roman, serif' }

]

const TextDoc = ({seeds, setSeeds}) => {
  const navigate = useNavigate();
  const { seedId } = useParams();

  const currentSeed = seeds.find(s => s.id === seedId);

  const [title, setTitle] = useState(currentSeed?.text || "");
  const [content, setContent] = useState(currentSeed?.content || "");

  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [fontFamily, setFontFamily] = useState('inherit');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);



  useEffect(() => {
    if (!window.electronAPI) return;
    const timeout = setTimeout(() => {
      window.electronAPI.updateNote(seedId, {
        text: title || 'Untitled',
        content: content,
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [title, content, seedId]);

  // Also update local seeds state
  useEffect(() => {
    setSeeds(prev =>
      prev.map(s => s.id === seedId ? { ...s, text: title, content } : s)
    );
  }, [title, content, seedId, setSeeds]);

  useEffect(() => {                          // "whenever dependencies change, do this"
    const handleKeyDown = (e) => {           // define a function that runs on any keypress
      if (e.metaKey || e.ctrlKey) {          // check if Cmd (Mac) or Ctrl (Windows) is held
        if (e.key === 'b') {                 // if B is pressed
          e.preventDefault();               // stop browser's default bold behavior
          setIsBold(p => !p);               // toggle bold on/off
        }
        if (e.key === 'i') {                 // if I is pressed
          e.preventDefault();               // stop browser's default italic behavior
          setIsItalic(p => !p);             // toggle italic on/off
        }
        if (e.key === 'u') {                 // if U is pressed
          e.preventDefault();               // stop browser's default underline behavior
          setIsUnderline(p => !p);          // toggle underline on/off
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);       // start listening for keypresses
    return () => window.removeEventListener('keydown', handleKeyDown); // stop listening when note closes
  }, []);                                    // empty array = only run once when note opens


  const handleSpeech = () => {
    console.log('SpeechRecognition:', window.SpeechRecognition);
    console.log('webkitSpeechRecognition:', window.webkitSpeechRecognition);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      setContent(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (e) => {
      console.log('Speech error:', e.error);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

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

          {/* Aa - Font Picker */}
          <div className="dropdown-wrapper">
            <button className="tool-btn" onClick={() => { setShowFontMenu(p => !p); setShowFormatMenu(false); }}>Aa</button>
            {showFontMenu && (
              <div className="dropdown-menu">
                {FONTS.map(f => (
                  <div
                    key={f.value}
                    className={`dropdown-item ${fontFamily === f.value ? 'active' : ''}`}
                    style={{ fontFamily: f.value }}
                    onClick={() => { setFontFamily(f.value); setShowFontMenu(false); }}
                  >
                    {f.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 田 - Grid Toggle */}
          <button
            className={`tool-btn ${gridEnabled ? 'active-btn' : ''}`}
            onClick={() => setGridEnabled(p => !p)}
          >田</button>

          {/* 🖼️ - Formatting */}
          <div className="dropdown-wrapper">
            <button className="tool-btn" onClick={() => { setShowFormatMenu(p => !p); setShowFontMenu(false); }}>🖼️</button>
            {showFormatMenu && (
              <div className="dropdown-menu">
                <div className={`dropdown-item ${isBold ? 'active' : ''}`} onClick={() => setIsBold(p => !p)}>
                  <strong>Bold</strong> <span className="shortcut">⌘B</span>
                </div>
                <div className={`dropdown-item ${isItalic ? 'active' : ''}`} onClick={() => setIsItalic(p => !p)}>
                  <em>Italic</em> <span className="shortcut">⌘I</span>
                </div>
                <div className={`dropdown-item ${isUnderline ? 'active' : ''}`} onClick={() => setIsUnderline(p => !p)}>
                  <u>Underline</u> <span className="shortcut">⌘U</span>
                </div>
              </div>
            )}
          </div>

          {/* 🎤 - Speech to Text */}
          <button
            className={`tool-btn ${isListening ? 'active-btn' : ''}`}
            onClick={handleSpeech}
          >🎤</button>

        </div>

        <div className="toolbar-right">
          <button className="tool-btn">📤</button>
          <button className="tool-btn">⋯</button>
        </div>
      </header>

      {/* 2. WRITING AREA */}
      <main className={`doc-body ${gridEnabled ? 'grid-bg' : ''}`}>
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
          style={{
            fontFamily,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
          }}
        />
      </main>
    </div>
  );
};

export default TextDoc;