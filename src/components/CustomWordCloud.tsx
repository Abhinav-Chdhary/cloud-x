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

        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        const maxFreq = Math.max(...words.map(w => w.value))
        const minFreq = Math.min(...words.map(w => w.value))
        const sortedWords = [...words].sort((a, b) => b.value - a.value)

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`
        svgContent += `<rect width="100%" height="100%" fill="#1a1a1a"/>\n`

        const tempCanvas = document.createElement('canvas')
        const ctx = tempCanvas.getContext('2d')
        if (!ctx) return

        const positions = calculateWordPositions(sortedWords, width, height, minFreq, maxFreq, ctx)

        positions.forEach((pos, index) => {
          const color = getColor(index)
          svgContent += `<text x="${pos.x}" y="${pos.y}" font-size="${pos.fontSize}" fill="${color}" font-weight="600" font-family="system-ui, -apple-system, sans-serif">${pos.word.text}</text>\n`
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
      fontSize: number
    }

    interface Rectangle {
      x: number
      y: number
      width: number
      height: number
    }

    const rectanglesOverlap = (rect1: Rectangle, rect2: Rectangle): boolean => {
      return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
      )
    }

    const calculateWordPositions = (
      sortedWords: WordData[],
      width: number,
      height: number,
      minFreq: number,
      maxFreq: number,
      ctx: CanvasRenderingContext2D
    ): WordPosition[] => {
      const positions: WordPosition[] = []
      const margin = 5
      const centerX = width / 2
      const centerY = height / 2
      const padding = 3

      sortedWords.forEach((word) => {
        const fontSize = getSize(word.value, minFreq, maxFreq)
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
        const metrics = ctx.measureText(word.text)
        const wordWidth = metrics.width
        const wordHeight = fontSize * 1.2

        let placed = false
        let radius = 0
        const maxRadius = Math.sqrt(width * width + height * height) / 2
        const radiusStep = 2

        // Try to place the word using spiral algorithm
        while (!placed && radius < maxRadius) {
          const numAngles = radius === 0 ? 1 : Math.max(12, Math.floor((2 * Math.PI * radius) / (fontSize / 4)))
          const currentAngleStep = radius === 0 ? 0 : (2 * Math.PI) / numAngles

          for (let i = 0; i < (radius === 0 ? 1 : numAngles); i++) {
            const angle = i * currentAngleStep
            const x = centerX + radius * Math.cos(angle) - wordWidth / 2
            const y = centerY + radius * Math.sin(angle) + fontSize / 3

            // Check if word fits in canvas with margin
            if (
              x < margin ||
              y - wordHeight < margin ||
              x + wordWidth > width - margin ||
              y > height - margin
            ) {
              continue
            }

            const candidate: Rectangle = {
              x: x - padding,
              y: y - wordHeight - padding,
              width: wordWidth + padding * 2,
              height: wordHeight + padding * 2
            }

            // Check for collisions with existing words
            let hasCollision = false
            for (const pos of positions) {
              const existingRect: Rectangle = {
                x: pos.x - padding,
                y: pos.y - pos.height - padding,
                width: pos.width + padding * 2,
                height: pos.height + padding * 2
              }

              if (rectanglesOverlap(candidate, existingRect)) {
                hasCollision = true
                break
              }
            }

            if (!hasCollision) {
              positions.push({
                word,
                x,
                y,
                width: wordWidth,
                height: wordHeight,
                fontSize
              })
              placed = true
              break
            }
          }

          radius += radiusStep
        }

        // If word couldn't be placed with spiral, skip it
        if (!placed) {
          console.warn(`Could not place word: ${word.text} (${positions.length}/${sortedWords.length} placed so far)`)
        }
      })

      return positions
    }

    useEffect(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container || words.length === 0) return

      const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()

        // Set actual size in pixels
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr

        // Set display size
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Scale for high DPI displays
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, rect.width, rect.height)

        const maxFreq = Math.max(...words.map(w => w.value))
        const minFreq = Math.min(...words.map(w => w.value))
        const sortedWords = [...words].sort((a, b) => b.value - a.value)

        const positions = calculateWordPositions(sortedWords, rect.width, rect.height, minFreq, maxFreq, ctx)

        positions.forEach((pos, index) => {
          ctx.font = `600 ${pos.fontSize}px system-ui, -apple-system, sans-serif`
          ctx.fillStyle = getColor(index)
          ctx.fillText(pos.word.text, pos.x, pos.y)
        })
      }

      // Use setTimeout to ensure layout is complete before measuring
      const timeoutId = setTimeout(resizeCanvas, 0)

      // Add resize listener
      window.addEventListener('resize', resizeCanvas)
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', resizeCanvas)
      }
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
