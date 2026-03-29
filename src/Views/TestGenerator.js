import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.js';
import TestModal from './TestModal.js';
import './TestGenerator.css';

const TestGenerator = ({ isCollapsed, setIsCollapsed, seeds }) => {
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [questionType, setQuestionType] = useState('mixed');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);
    const [selectedNoteId, setSelectedNoteId] = useState('');
    const [testQuestions, setTestQuestions] = useState(null);
    const availableNotes = seeds.filter(s => s.type !== 'folder');

    const CURATOR_TIPS = [
      { title: "Active Recall", text: "Use Short Answer mode to force active recall. It's the most effective way to strengthen neural pathways during your study sessions." },
      { title: "Spaced Repetition", text: "Retake tests on material you struggled with after 24 hours. Spacing out practice sessions dramatically improves long-term retention." },
      { title: "Bloom's Taxonomy", text: "Higher-order questions that ask you to analyze or evaluate are more valuable than simple recall. Push yourself to explain the why." },
      { title: "Feynman Technique", text: "After revealing an answer, try explaining it out loud in your own words. If you can't, you haven't learned it yet." },
      { title: "Interleaving", text: "Mix topics when generating tests rather than drilling one subject. Interleaving feels harder but leads to stronger long-term learning." },
      { title: "Test Conditions", text: "Simulate real exam conditions — no notes, timed. The stress of retrieval is what makes the memory stick." },
      { title: "Elaborative Interrogation", text: "When you see a fact, ask yourself why it's true. Connecting new information to existing knowledge is the key to deep understanding." },
    ];

    const [tip] = useState(() => CURATOR_TIPS[Math.floor(Math.random() * CURATOR_TIPS.length)]);

    useEffect(() => {
        if (!isGenerating) return;
        setLoadingProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 8;
            if (progress >= 90) { progress = 90; clearInterval(interval); }
            setLoadingProgress(progress);
        }, 400);
        return () => clearInterval(interval);
    }, [isGenerating]);

    const handleImportNote = () => {
        if (!selectedNoteId) { setError('Please select a note to import'); return; }
        const selectedNote = seeds.find(s => s.id === selectedNoteId);
        if (selectedNote) { setTopic(selectedNote.content || ''); setError(null); }
    };

    const parseTest = (text) => {
        const questions = [];
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            if (line.match(/^Q\d+:/)) {
                const questionText = line.replace(/^Q\d+:\s*/, '').trim();
                const question = { question: questionText, type: 'short', choices: [], correctAnswer: null, explanation: '', keyPoints: '' };
                i++;
                const choiceLines = [];
                let correctAnswer = null;
                let explanationLines = [], keyPointsLines = [], guidanceLines = [];
                let currentSection = null;
                while (i < lines.length && !lines[i].match(/^Q\d+:/)) {
                    const l = lines[i];
                    if (l.match(/^[A-D]\)/)) { choiceLines.push({ letter: l[0], text: l.substring(2).trim() }); question.type = 'mc'; currentSection = null; }
                    else if (l.startsWith('Correct Answer:')) { correctAnswer = l.replace('Correct Answer:', '').trim().charAt(0); currentSection = null; }
                    else if (l.startsWith('Explanation:')) { const inline = l.replace('Explanation:', '').trim(); if (inline) explanationLines.push(inline); currentSection = 'explanation'; }
                    else if (l.startsWith('Key Points:')) { const inline = l.replace('Key Points:', '').trim(); if (inline) keyPointsLines.push(inline); question.type = 'short'; currentSection = 'keypoints'; }
                    else if (l.startsWith('Guidance:')) { const inline = l.replace('Guidance:', '').trim(); if (inline) guidanceLines.push(inline); question.type = 'essay'; currentSection = 'guidance'; }
                    else {
                        if (currentSection === 'explanation') explanationLines.push(l);
                        else if (currentSection === 'keypoints') keyPointsLines.push(l);
                        else if (currentSection === 'guidance') guidanceLines.push(l);
                    }
                    i++;
                }
                question.choices = choiceLines;
                question.correctAnswer = correctAnswer;
                question.explanation = explanationLines.join(' ');
                question.keyPoints = keyPointsLines.join(' ') || guidanceLines.join(' ');
                questions.push(question);
            } else { i++; }
        }
        return questions;
    };

    const handleGenerate = async () => {
        if (!topic.trim()) { setError('Please enter a topic or paste your notes'); return; }
        setIsGenerating(true);
        setError(null);
        try {
            let prompt = `You are an expert educator creating high-level thinking questions that test deep understanding, not just memorization.

            Topic/Notes: ${topic}

            Generate ${numQuestions} ${questionType === 'mixed' ? 'questions (mix of multiple choice, short answer, and essay)' : questionType} questions that:
            1. Test critical thinking and analysis
            2. Require applying concepts, not just recalling facts
            3. Encourage deeper understanding
            4. Use Bloom's Taxonomy higher levels (Analyze, Evaluate, Create)`;

            if (questionType === 'multiple-choice' || questionType === 'mixed') {
                prompt += `\nFor multiple choice questions, format EXACTLY as:
                Q1: [Question text]
                A) [Option A]
                B) [Option B]
                C) [Option C]
                D) [Option D]
                Correct Answer: [Letter]
                Explanation: [Why this is correct. Have an explanation but not too long like paragraphs.]`;
            }
            if (questionType === 'short-answer' || questionType === 'mixed') {
                prompt += `\nFor short answer questions, format EXACTLY as:
                Q#: [Question text]
                Key Points: [What a good answer should include. Have an explanation but not too long like paragraphs.]`;
            }
            if (questionType === 'essay' || questionType === 'mixed') {
                prompt += `\nFor essay questions, format EXACTLY as:
                Q#: [Question text]
                Guidance: [What the essay should address. Have an explanation but not too long like paragraphs.]`;
            }
            prompt += `\n\nIMPORTANT: Follow the format exactly. Every question must start with Q followed by a number and colon. Do not add any preamble or closing remarks.`;

            const result = await window.electronAPI.generateTest({ prompt });
            if (!result.success) throw new Error(result.error || 'API request failed');
            const text = result.data.candidates[0].content.parts[0].text;
            const parsed = parseTest(text);
            setLoadingProgress(100);
            setTimeout(() => {
                if (parsed.length > 0) { setTestQuestions(parsed); }
                else { setError('Could not parse the generated test. Please try again.'); }
                setIsGenerating(false);
                setLoadingProgress(0);
            }, 400);
        } catch (err) {
            console.error('Error generating test:', err);
            setError('Failed to generate test. Please try again.');
            setLoadingProgress(100);
            setTimeout(() => { setIsGenerating(false); setLoadingProgress(0); }, 400);
        }
    };

    

    return (
        <>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div
            className="test-generator-container"
            style={{ marginLeft: isCollapsed ? '72px' : '220px' }}
        >
            <div className="test-gen-inner">

                {/* ── HEADER ── */}
                <div className="test-gen-header">
                    <div className="page-eyebrow-tag">
                        ✦ AI Intelligence
                    </div>
                    <h1>AI-Powered Test <em>Generator</em></h1>
                    <p>Transform your notes into comprehensive assessments. Produce high-retention questions designed for deep learning.</p>
                </div>

                {/* ── TWO COLUMN GRID ── */}
                <div className="test-gen-grid">

                    {/* LEFT — Source Material */}
                    <div>
                        {availableNotes.length > 0 && (
                            <div className="tg-card">
                                <div className="tg-card-label">Source Material</div>
                                <div className="import-row">
                                    <select
                                        value={selectedNoteId}
                                        onChange={(e) => setSelectedNoteId(e.target.value)}
                                        className="note-select"
                                    >
                                        <option value="">Choose a note to import…</option>
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

                        <div className="tg-card" style={{ marginTop: availableNotes.length > 0 ? 16 : 0 }}>
                            <div className="tg-card-label">
                                Topic or study notes
                                <span className="tg-char-count">{topic.length} / 10,000</span>
                            </div>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Paste your notes here or describe a specific topic you want to be tested on. The more detail you provide, the more tailored the test will be…"
                                className="topic-input"
                            />
                        </div>
                    </div>

                    {/* RIGHT — Settings */}
                    <div>
                        <div className="tg-card">
                            <div className="tg-settings-title">Test Settings</div>

                            <div className="tg-field">
                                <label>Number of questions</label>
                                <input
                                    type="number"
                                    value={numQuestions}
                                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                    min="1"
                                    max="20"
                                    className="num-input"
                                />
                            </div>

                            <div className="tg-field">
                                <label>Question type</label>
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

                            {error && <div className="error-message">{error}</div>}

                            {isGenerating && (
                                <div className="loading-bar-wrap">
                                    <div className="loading-bar-fill" style={{ width: `${loadingProgress}%` }} />
                                </div>
                            )}

                            <button
                                onClick={handleGenerate}
                                disabled={!topic.trim() || isGenerating}
                                className="generate-btn"
                            >
                                {isGenerating ? 'Generating…' : '✦ Generate test'}
                            </button>
                            <p className="generate-btn-note">
                                Generation usually takes 15–30 seconds depending on the volume of source material provided.
                            </p>
                        </div>

                        {/* Curator's Tip */}
                        <div className="tg-tip-card">
                          <div className="tg-tip-content">
                            <h4 className="tg-tip-title">Curator's Tip: {tip.title}</h4>
                            <p className="tg-tip-text">{tip.text}</p>
                          </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {testQuestions && (
            <TestModal
                questions={testQuestions}
                onClose={() => setTestQuestions(null)}
            />
        )}
        </>
    );
};

export default TestGenerator;