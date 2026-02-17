import React, { useState } from 'react';
import Sidebar from './Sidebar.js'
import { GoogleGenerativeAI } from '@google/generative-ai';
import './TestGenerator.css';

const TestGenerator = ({ isCollapsed, setIsCollapsed, seeds }) => {
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [questionType, setQuestionType] = useState('mixed');
    const [generatedTest, setGeneratedTest] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [selectedNoteId, setSelectedNoteId] = useState('');
    const availableNotes = seeds.filter(s => s.type !== 'folder');

    const handleImportNote = () => {
        if (!selectedNoteId) {
        setError('Please select a note to import');
        return;
        }

    const selectedNote = seeds.find(s => s.id === selectedNoteId);
        if (selectedNote) {
        setTopic(selectedNote.content || '');
        setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic or paste your notes');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedTest(null);

        try {
        // Initialize Gemini
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                apiVersion: "v1"  // Force v1 instead of v1beta
            });

            // Create the prompt based on question type
            let prompt = `You are an expert educator creating high-level thinking questions that test deep understanding, not just memorization.

            Topic/Notes: ${topic}

            Generate ${numQuestions} ${questionType === 'mixed' ? 'questions (mix of multiple choice, short answer, and essay)' : questionType} questions that:
            1. Test critical thinking and analysis
            2. Require applying concepts, not just recalling facts
            3. Encourage deeper understanding
            4. Use Bloom's Taxonomy higher levels (Analyze, Evaluate, Create)`;

            if (questionType === 'multiple-choice' || questionType === 'mixed') {
                prompt += `\nFor multiple choice questions, format as:
                Q1: [Question text]
                A) [Option A]
                B) [Option B]
                C) [Option C]
                D) [Option D]
                Correct Answer: [Letter]
                Explanation: [Why this tests understanding]
                `;
            }

            if (questionType === 'short-answer' || questionType === 'mixed') {
                prompt += `\nFor short answer questions, format as:
                Q#: [Question text]
                Key Points: [What a good answer should include]
                `;
            }

            if (questionType === 'essay' || questionType === 'mixed') {
                prompt += `\nFor essay questions, format as:
                Q#: [Question text]
                Guidance: [What the essay should address]`;
            }

        // Generate content
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

        // Parse the response
            setGeneratedTest({
                title: `Test: ${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}`,
                content: text,
                timestamp: new Date().toLocaleString()
            });

        } catch (err) {
        console.error('Error generating test:', err);
        setError('Failed to generate test. Please try again.');
        } finally {
        setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (generatedTest) {
        navigator.clipboard.writeText(generatedTest.content);
        alert('Test copied to clipboard!');
        }
    };

    const handleSaveAsNote = () => {
        // TODO: Save to workspace as a new note
        alert('Save as note feature coming soon!');
    };

    return (
        <>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div 
            className="test-generator-container"
            style={{ marginLeft: isCollapsed ? '70px' : '240px' }}
        >
            <div className="test-gen-header">
            <h1>🧠 AI Test Generator</h1>
            <p>Generate high-level thinking tests from your study materials</p>
            </div>

            <div className="test-gen-content">
                <div className="input-section">
                    {availableNotes.length > 0 && (
                    <div className="import-section">
                        <label>📁 Import from Your Notes</label>
                        <div className="import-row">
                        <select
                            value={selectedNoteId}
                            onChange={(e) => setSelectedNoteId(e.target.value)}
                            className="note-select"
                        >
                            <option value="">Select a note...</option>
                            {availableNotes.map(note => (
                            <option key={note.id} value={note.id}>
                                {note.text} ({note.type === 'notebook' ? 'Notebook' : 'Text Doc'})
                            </option>
                            ))}
                        </select>
                        <button 
                            onClick={handleImportNote}
                            className="import-btn"
                            disabled={!selectedNoteId}
                        >
                        Import
                        </button>
                    </div>
                </div>
                )}

                <div className="divider-text">
                <span>or enter manually</span>
                </div>

                <div className="input-group">
                <label>Topic or Paste Notes</label>
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., 'Photosynthesis') or paste your study notes here..."
                    className="topic-input"
                />
                </div>

                <div className="options-row">
                <div className="input-group">
                    <label>Number of Questions</label>
                    <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    min="1"
                    max="20"
                    className="num-input"
                    />
                </div>

                <div className="input-group">
                    <label>Question Type</label>
                    <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="type-select"
                    >
                    <option value="mixed">Mixed (Recommended)</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay Questions</option>
                    </select>
                </div>
                </div>

                {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
                )}

                <button
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="generate-btn"
                >
                {isGenerating ? '⏳ Generating Test...' : '✨ Generate Test'}
                </button>
            </div>

            {generatedTest && (
                <div className="results-section">
                <div className="results-header">
                    <h2>{generatedTest.title}</h2>
                    <div className="results-actions">
                    <button onClick={handleCopy} className="action-btn">
                        📋 Copy
                    </button>
                    <button onClick={handleSaveAsNote} className="action-btn">
                        💾 Save as Note
                    </button>
                    </div>
                </div>
                
                <div className="test-content">
                    <pre>{generatedTest.content}</pre>
                </div>
                
                <div className="timestamp">
                    Generated: {generatedTest.timestamp}
                </div>
                </div>
            )}
            </div>
        </div>
        </>
    );
};

export default TestGenerator;