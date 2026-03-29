import React, { useState } from 'react';
import './TestModal.css';

const TestModal = ({ questions, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/>\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/\n{2,}/g, ' ')
      .trim();
  };

  const handleChoiceSelect = (letter) => {
    if (selectedAnswer) return;
    const isCorrect = letter === q.correctAnswer;
    setSelectedAnswer(letter);
    setAnswers(prev => [...prev, { correct: isCorrect, type: q.type }]);
  };

  const handleReveal = () => {
    setRevealed(true);
    setAnswers(prev => {
      const updated = [...prev];
      updated[current] = { correct: null, type: q.type };
      return updated;
    });
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  const handleRetake = () => {
    setCurrent(0);
    setSelectedAnswer(null);
    setRevealed(false);
    setAnswers([]);
    setDone(false);
  };

  const mcScore = answers.filter(a => a.type === 'mc' && a.correct === true).length;
  const mcTotal = answers.filter(a => a.type === 'mc').length;

  const canAdvance = () => {
    if (q.type === 'mc') return selectedAnswer !== null;
    return revealed;
  };

  const renderKeyPoints = (text) => {
    if (!text) return null;
    return cleanText(text)
      .split(/[.\n]/)
      .filter(line => line.trim().length > 10)
      .slice(0, 4)
      .map((line, i) => {
        const cleaned = line
          .replace(/^[\s]*[-*•]\s*/, '')
          .replace(/^[\s]*\d+\.\s*/, '')
          .trim();
        if (!cleaned) return null;
        return (
          <div key={i} className="key-point-item">
            <span className="key-point-dot" />
            {cleaned}
          </div>
        );
      });
  };

  const renderExplanation = (text) => {
    if (!text) return null;
    const cleaned = cleanText(text);
    const sentences = cleaned.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('.') + '.';
  };

  if (done) {
    return (
      <div className="test-modal-overlay">
        <div className="test-modal">
          <div className="test-modal-header">
            <div className="test-modal-progress-wrap">
              <div className="test-modal-progress-label">Test complete</div>
              <div className="test-modal-progress-bar">
                <div className="test-modal-progress-fill" style={{ width: '100%' }} />
              </div>
            </div>
            <button className="test-modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="test-modal-body">
            <div className="results-screen">
              {mcTotal > 0 && (
                <>
                  <div className="results-score">
                    {mcScore}<span>/{mcTotal}</span>
                  </div>
                  <div className="results-label">multiple choice correct</div>
                </>
              )}

              <div className="results-breakdown">
                {questions.map((q, i) => {
                  const a = answers[i];
                  return (
                    <div key={i} className="breakdown-item">
                      <span className="bq">Q{i + 1}: {cleanText(q.question).substring(0, 60)}{q.question.length > 60 ? '…' : ''}</span>
                      <span className={`breakdown-badge ${a?.correct === true ? 'correct' : a?.correct === false ? 'wrong' : 'open'}`}>
                        {a?.correct === true ? '✓ Correct' : a?.correct === false ? '✗ Wrong' : 'Open'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button className="retake-btn" onClick={handleRetake}>Retake test</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-modal-overlay">
      <div className="test-modal">

        {/* HEADER */}
        <div className="test-modal-header">
          <div className="test-modal-progress-wrap">
            <div className="test-modal-progress-label">
              Question {current + 1} of {questions.length}
            </div>
            <div className="test-modal-progress-bar">
              <div className="test-modal-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button className="test-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="test-modal-body">
          <div className="question-type-tag">
            {q.type === 'mc' ? 'Multiple Choice' : q.type === 'short' ? 'Short Answer' : 'Essay'}
          </div>
          <div className="question-text">{cleanText(q.question)}</div>

          {/* MULTIPLE CHOICE */}
          {q.type === 'mc' && (
            <>
              <div className="choices-list">
                {q.choices.map(({ letter, text }) => {
                  let cls = 'choice-btn';
                  if (selectedAnswer) {
                    if (letter === q.correctAnswer) cls += ' reveal-correct';
                    if (letter === selectedAnswer && letter !== q.correctAnswer) cls += ' selected-wrong';
                    if (letter === selectedAnswer && letter === q.correctAnswer) cls = 'choice-btn selected-correct';
                  }
                  return (
                    <button
                      key={letter}
                      className={cls}
                      onClick={() => handleChoiceSelect(letter)}
                      disabled={!!selectedAnswer}
                    >
                      <span className="choice-letter">{letter}</span>
                      {cleanText(text)}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div className={`answer-feedback ${selectedAnswer === q.correctAnswer ? 'correct' : 'wrong'}`}>
                  <div className="feedback-label">
                    {selectedAnswer === q.correctAnswer ? '✓ Correct!' : '✗ Not quite'}
                  </div>
                  {renderExplanation(q.explanation)}
                </div>
              )}
            </>
          )}

          {/* SHORT ANSWER / ESSAY */}
          {(q.type === 'short' || q.type === 'essay') && (
            <>
              {!revealed && (
                <button className="reveal-btn" onClick={handleReveal}>
                  Reveal answer →
                </button>
              )}
              {revealed && (
                <div className="key-points">
                  <div className="key-points-label">
                    {q.type === 'short' ? 'Key points' : 'Guidance'}
                  </div>
                  <div className="key-points-body">
                    {renderKeyPoints(q.keyPoints)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="test-modal-footer">
          <span className="question-counter">{current + 1} / {questions.length}</span>
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!canAdvance()}
          >
            {current + 1 === questions.length ? 'Finish' : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TestModal;