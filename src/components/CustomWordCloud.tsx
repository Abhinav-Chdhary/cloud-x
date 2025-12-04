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
    const minSize = 14
    const maxSize = 72
    const normalized = (value - minFreq) / (maxFreq - minFreq)
    return minSize + normalized * (maxSize - minSize)
  }

  const getColor = (index: number) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#00f2fe', '#43e97b', '#fa709a', '#fee140',
      '#30cfd0', '#330867', '#ff6a00', '#ee0979',
      '#ffd89b', '#19547b', '#fbc92c', '#65fd58'
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
            opacity: 0.8 + (word.value / maxFreq) * 0.2,
            transform: `rotate(${Math.random() > 0.5 ? 90 : 0}deg)`,
          }}
          title={`${word.text}: ${word.value} occurrences`}
        >
          {word.text}
        </span>
      ))}
    </div>
  )
}

export default CustomWordCloud
