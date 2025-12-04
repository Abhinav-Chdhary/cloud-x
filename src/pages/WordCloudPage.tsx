import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import Wordcloud from 'react-wordcloud'
import { generateWordCloud, getColorByIndex } from '../utils/wordCloudUtils'
import './WordCloudPage.css'

interface LocationState {
  text: string
}

function WordCloudPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  if (!state?.text) {
    return (
      <div className="wordcloud-container">
        <div className="error-state">
          <h2>No text provided</h2>
          <p>Please go back and enter some text to create a word cloud</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const words = useMemo(() => generateWordCloud(state.text, 80), [state.text])

  const options = {
    rotations: 2,
    rotationAngles: [0, 90] as [number, number],
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSizes: [20, 80] as [number, number],
    fontStyle: 'normal' as const,
    fontWeight: 'bold' as const,
    padding: 5,
    colors: words.map((_, i) => getColorByIndex(i, words.length)),
  }

  return (
    <div className="wordcloud-container">
      <div className="wordcloud-header">
        <h1>Your Word Cloud</h1>
        <p className="subtitle">Most frequent words from your text</p>
      </div>

      {words.length > 0 ? (
        <div className="wordcloud-wrapper">
          <div className="wordcloud-canvas">
            <Wordcloud
              words={words}
              options={options}
            />
          </div>
        </div>
      ) : (
        <div className="no-words">
          <p>No words found to create a cloud</p>
        </div>
      )}

      <div className="wordcloud-stats">
        <div className="stat">
          <span className="stat-label">Unique Words:</span>
          <span className="stat-value">{words.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Characters:</span>
          <span className="stat-value">{state.text.length}</span>
        </div>
      </div>

      <div className="button-group">
        <button
          className="create-new-button"
          onClick={() => navigate('/')}
        >
          Create Another Cloud
        </button>
      </div>
    </div>
  )
}

export default WordCloudPage
