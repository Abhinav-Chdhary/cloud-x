import type { WordData } from '../utils/wordCloudUtils'
import './CustomWordCloud.css'

interface CustomWordCloudProps {
  words: WordData[]
}

function CustomWordCloud({ words }: CustomWordCloudProps) {
  if (words.length === 0) return null

  const maxFreq = Math.max(...words.map(w => w.value))
  const minFreq = Math.min(...words.map(w => w.value))

  const getSize = (value: number) => {
    const minSize = 16
    const maxSize = 80
    const normalized = (value - minFreq) / (maxFreq - minFreq)
    return minSize + normalized * (maxSize - minSize)
  }

  const getColor = (index: number) => {
    const colors = [
      '#c2a876', '#9b8b5c', '#d4a574', '#b19956',
      '#e8b4a8', '#d97f85', '#c97c9e', '#9b7ec4',
      '#8a9bc9', '#6bb3d4', '#5fc9d9', '#4eb8a8',
      '#8ec4a0', '#a8d4a8', '#c4d4a0', '#d4c4a0',
      '#d9a890', '#c994a0', '#a894c4', '#9894d4'
    ]
    return colors[index % colors.length]
  }

  const shuffledWords = [...words].sort(() => Math.random() - 0.5)

  return (
    <div className="custom-wordcloud">
      {shuffledWords.map((word, index) => (
        <span
          key={`${word.text}-${index}`}
          className="word"
          style={{
            fontSize: `${getSize(word.value)}px`,
            color: getColor(index),
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  )
}

export default CustomWordCloud
