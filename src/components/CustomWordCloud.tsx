import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import type { WordData } from '../utils/wordCloudUtils'
import './CustomWordCloud.css'

interface CustomWordCloudProps {
  words: WordData[]
}

export interface WordCloudHandle {
  downloadPNG: () => void
  downloadSVG: () => void
}

const CustomWordCloud = forwardRef<WordCloudHandle, CustomWordCloudProps>(
  ({ words }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const getSize = (value: number, minFreq: number, maxFreq: number) => {
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

    useImperativeHandle(ref, () => ({
      downloadPNG: () => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `wordcloud-${Date.now()}.png`
          link.click()
          URL.revokeObjectURL(url)
        })
      },
      downloadSVG: () => {
        if (words.length === 0) return

        const maxFreq = Math.max(...words.map(w => w.value))
        const minFreq = Math.min(...words.map(w => w.value))
        const shuffledWords = [...words].sort(() => Math.random() - 0.5)

        const canvas = canvasRef.current
        if (!canvas) return

        const width = canvas.width
        const height = canvas.height

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`
        svgContent += `<rect width="100%" height="100%" fill="#1a1a1a"/>\n`

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const positions = calculateWordPositions(shuffledWords, width, height, minFreq, maxFreq, ctx)

        positions.forEach((pos, index) => {
          const fontSize = getSize(pos.word.value, minFreq, maxFreq)
          const color = getColor(index)
          svgContent += `<text x="${pos.x}" y="${pos.y}" font-size="${fontSize}" fill="${color}" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${pos.word.text}</text>\n`
        })

        svgContent += '</svg>'

        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `wordcloud-${Date.now()}.svg`
        link.click()
        URL.revokeObjectURL(url)
      }
    }))

    interface WordPosition {
      word: WordData
      x: number
      y: number
      width: number
      height: number
    }

    const calculateWordPositions = (
      shuffledWords: WordData[],
      width: number,
      height: number,
      minFreq: number,
      maxFreq: number,
      ctx: CanvasRenderingContext2D
    ): WordPosition[] => {
      const positions: WordPosition[] = []
      const padding = 10
      let currentX = padding
      let currentY = padding
      let maxHeightInRow = 0

      shuffledWords.forEach((word) => {
        const fontSize = getSize(word.value, minFreq, maxFreq)
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
        const metrics = ctx.measureText(word.text)
        const wordWidth = metrics.width
        const wordHeight = fontSize * 1.2

        if (currentX + wordWidth + padding > width) {
          currentX = padding
          currentY += maxHeightInRow + padding
          maxHeightInRow = 0
        }

        if (currentY + wordHeight > height) {
          return
        }

        positions.push({
          word,
          x: currentX,
          y: currentY + fontSize,
          width: wordWidth,
          height: wordHeight
        })

        currentX += wordWidth + padding
        maxHeightInRow = Math.max(maxHeightInRow, wordHeight)
      })

      return positions
    }

    useEffect(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container || words.length === 0) return

      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const maxFreq = Math.max(...words.map(w => w.value))
      const minFreq = Math.min(...words.map(w => w.value))
      const shuffledWords = [...words].sort(() => Math.random() - 0.5)

      const positions = calculateWordPositions(shuffledWords, rect.width, rect.height, minFreq, maxFreq, ctx)

      positions.forEach((pos, index) => {
        const fontSize = getSize(pos.word.value, minFreq, maxFreq)
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
        ctx.fillStyle = getColor(index)
        ctx.fillText(pos.word.text, pos.x, pos.y)
      })
    }, [words])

    if (words.length === 0) return null

    return (
      <div ref={containerRef} className="custom-wordcloud">
        <canvas ref={canvasRef} />
      </div>
    )
  }
)

CustomWordCloud.displayName = 'CustomWordCloud'

export default CustomWordCloud
