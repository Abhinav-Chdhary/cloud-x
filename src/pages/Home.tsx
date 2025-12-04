import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const [text, setText] = useState('')
  const navigate = useNavigate()

  const handleCreateCloud = () => {
    if (text.trim()) {
      navigate('/wordcloud', { state: { text } })
    }
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="main-heading">cloud-x</h1>
        <p className="subtitle">Transform your text into beautiful word clouds</p>

        <div className="input-wrapper">
          <textarea
            className="text-input"
            placeholder="Dump your literature here... Paste your text, article, or any content you want to visualize as a word cloud"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          className="create-button"
          onClick={handleCreateCloud}
          disabled={!text.trim()}
        >
          Create Word Cloud
        </button>

        {text.trim() && (
          <p className="char-count">{text.length} characters</p>
        )}
      </div>
    </div>
  )
}

export default Home
