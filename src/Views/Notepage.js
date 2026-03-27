import React, { useState, useEffect } from 'react';
import './Notepage.css';
import { useParams, useNavigate } from 'react-router-dom';

const Notepage = ({ seeds, setSeeds }) => {
  const { seedId } = useParams();
  const navigate = useNavigate();
  const currentSeed = seeds.find(s => s.id === seedId);
  
  const [title, setTitle] = useState(currentSeed?.text || "");
  const [content, setContent] = useState(currentSeed?.content || "");
  const [fontSize, setFontSize] = useState(16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  useEffect(() => {
    setSeeds(prevSeeds => 
      prevSeeds.map(s => 
        s.id === seedId ? { ...s, text: title, content: content } : s
      )
    );
  }, [title, content, seedId, setSeeds]);

  const handleKeyDown = (e) => {
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newContent = content.substring(0, start) + '    ' + content.substring(end);
      setContent(newContent);
      
      // Move cursor after the tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }

    // Enter to continue bullet points
    // Enter to continue bullet points or numbered lists
    if (e.key === 'Enter') {
      const start = e.target.selectionStart;
      const lines = content.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Check for bullet points
      const bulletMatch = currentLine.match(/^(\s*)([-*•]\s)/);
      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const bullet = bulletMatch[2];
        
        // If line is just a bullet with no text, remove it
        if (currentLine.trim() === bullet.trim()) {
          const newContent = content.substring(0, start - currentLine.length) + content.substring(start);
          setContent(newContent);
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = start - currentLine.length;
          }, 0);
        } else {
          // Continue the bullet point on next line
          const newContent = content.substring(0, start) + '\n' + indent + bullet + content.substring(start);
          setContent(newContent);
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = start + 1 + indent.length + bullet.length;
          }, 0);
        }
        return;
      }
  
  // Check for numbered lists
  const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
    if (numberMatch) {
      e.preventDefault();
      const indent = numberMatch[1];
      const number = parseInt(numberMatch[2]);
      
      // If line is just a number with no text, remove it
      if (currentLine.trim() === `${number}.`) {
        const newContent = content.substring(0, start - currentLine.length) + content.substring(start);
        setContent(newContent);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start - currentLine.length;
        }, 0);
      } else {
        // Continue with next number
        const nextNumber = number + 1;
        const newContent = content.substring(0, start) + '\n' + indent + nextNumber + '. ' + content.substring(start);
        setContent(newContent);
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = start + 1 + indent.length + String(nextNumber).length + 2;
        }, 0);
      }
    }
  }

    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      setIsBold(!isBold);
    }

    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      setIsItalic(!isItalic);
    }
  };

  // Insert bullet point
  const insertBullet = () => {
    const textarea = document.querySelector('.note-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(end);
    
    // Check if we're at the start of a line
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLineStart = lastNewline + 1;
    const currentLine = beforeCursor.substring(currentLineStart);
    
    let newContent;
    let cursorPos;
    
    if (currentLine.trim() === '') {
      // Add bullet at current position
      newContent = beforeCursor + '• ' + afterCursor;
      cursorPos = start + 2;
    } else {
      // Add bullet on new line
      newContent = beforeCursor + '\n• ' + afterCursor;
      cursorPos = start + 3;
    }
    
    setContent(newContent);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
      textarea.focus();
    }, 0);
  };

  // Insert numbered list
  const insertNumberedList = () => {
    const textarea = document.querySelector('.note-content');
    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);
    
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const currentLineStart = lastNewline + 1;
    const currentLine = beforeCursor.substring(currentLineStart);
    
    let newContent;
    let cursorPos;
    
    if (currentLine.trim() === '') {
      newContent = beforeCursor + '1. ' + afterCursor;
      cursorPos = start + 3;
    } else {
      newContent = beforeCursor + '\n1. ' + afterCursor;
      cursorPos = start + 4;
    }
    
    setContent(newContent);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
      textarea.focus();
    }, 0);
  };

  if (!currentSeed) {
    return <div className="error-msg">Note not found!</div>;
  }

  return (
    <div className="notepage-container">
      {/* Top Toolbar */}
      <div className="note-toolbar">
        <div className="toolbar-left">
          <button onClick={() => navigate('/workspace')} className="back-btn">
            ← Back to Workspace
          </button>
        </div>

        <div className="toolbar-center">
          <button 
            className={`format-btn ${isBold ? 'active' : ''}`}
            onClick={() => setIsBold(!isBold)}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button 
            className={`format-btn ${isItalic ? 'active' : ''}`}
            onClick={() => setIsItalic(!isItalic)}
            title="Italic"
          >
            <em>I</em>
          </button>

          <div className="divider"></div>

          <button 
            className="format-btn"
            onClick={insertBullet}
            title="Bullet List"
          >
            •
          </button>
          <button 
            className="format-btn"
            onClick={insertNumberedList}
            title="Numbered List"
          ></button>
          
          <div className="divider"></div>
          
          <div className="divider"></div>

          <button 
            className="format-btn"
            onClick={() => setFontSize(Math.max(8, fontSize - 1))}
            title="Decrease font size"
          >
            A-
          </button>
          <input
            type="number"
            className="font-size-input"
            value={fontSize}
            onChange={(e) => {
              const size = parseInt(e.target.value);
              if (size >= 8 && size <= 72) {
                setFontSize(size);
              }
            }}
            min="8"
            max="72"
          />
          <button 
            className="format-btn"
            onClick={() => setFontSize(Math.min(72, fontSize + 1))}
            title="Increase font size"
          >
            A+
          </button>
        </div>

        <div className="toolbar-right">
          <span className="word-count">
            {content.trim().split(/\s+/).filter(w => w).length} words
          </span>
        </div>
      </div>

      {/* Title Input */}
      <div className="note-header">
        <input 
          type="text"
          className="note-title"
          placeholder="Untitled Note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="note-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Content Area */}
      <textarea 
        className="note-content"
        placeholder="Start typing your notes here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal'
        }}
      />
    </div>
  );
};

export default Notepage;