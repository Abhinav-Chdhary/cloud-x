import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef } from "react";
import { generateWordCloud } from "../utils/wordCloudUtils";
// Components
import CustomWordCloud, { type WordCloudHandle } from "../components/CustomWordCloud";
// Styles
import "./WordCloudPage.css";

interface LocationState {
  text: string;
}

function WordCloudPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [wordCount, setWordCount] = useState(50);
  const wordCloudRef = useRef<WordCloudHandle>(null);

  if (!state?.text) {
    return (
      <div className="wordcloud-container">
        <div className="error-state">
          <h2>No text provided</h2>
          <p>Please go back and enter some text to create a word cloud</p>
          <button onClick={() => navigate("/")} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const allWords = useMemo(
    () => generateWordCloud(state.text, 200),
    [state.text]
  );
  const words = useMemo(
    () => allWords.slice(0, wordCount),
    [allWords, wordCount]
  );

  return (
    <div className="wordcloud-container">
      <div className="top-bar">
        <div className="top-bar-left">
          <h2 className="top-bar-title" onClick={() => navigate("/")}>
            cloud-x
          </h2>
        </div>
        <div className="top-bar-right">
          <button className="top-bar-button" onClick={() => navigate("/")}>
            Create New Cloud
          </button>
        </div>
      </div>

      <div className="wordcloud-header">
        <h1>Your Word Cloud</h1>
        <p className="subtitle">Most frequent words from your text</p>
      </div>

      <div className="controls-section">
        <div className="word-count-control">
          <label htmlFor="word-count-slider">Number of Words: </label>
          <div className="slider-container">
            <input
              id="word-count-slider"
              type="range"
              min="1"
              max={Math.min(allWords.length, 150)}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="slider"
            />
            <input
              type="number"
              min="1"
              max={Math.min(allWords.length, 150)}
              value={wordCount}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === "") {
                  setWordCount(0);
                } else {
                  const value = Number(inputValue);
                  const maxWords = Math.min(allWords.length, 150);
                  if (!isNaN(value)) {
                    const clampedValue = Math.max(1, Math.min(value, maxWords));
                    setWordCount(clampedValue);
                  }
                }
              }}
              className="word-count-input"
            />
          </div>
        </div>

        <div className="wordcloud-stats-inline">
          <div className="stat-inline">
            <span className="stat-label">Unique Words:</span>
            <span className="stat-value">{words.length}</span>
          </div>
          <div className="stat-inline">
            <span className="stat-label">Total Characters:</span>
            <span className="stat-value">{state.text.length}</span>
          </div>
        </div>

        <div className="download-buttons">
          <button
            className="download-button"
            onClick={() => wordCloudRef.current?.downloadPNG()}
            title="Download as PNG"
          >
            Download PNG
          </button>
          <button
            className="download-button"
            onClick={() => wordCloudRef.current?.downloadSVG()}
            title="Download as SVG"
          >
            Download SVG
          </button>
        </div>
      </div>

      {words.length > 0 ? (
        <div className="wordcloud-wrapper">
          <div className="wordcloud-canvas">
            <CustomWordCloud ref={wordCloudRef} words={words} />
          </div>
        </div>
      ) : (
        <div className="no-words">
          <p>No words found to create a cloud</p>
        </div>
      )}
    </div>
  );
}

export default WordCloudPage;
