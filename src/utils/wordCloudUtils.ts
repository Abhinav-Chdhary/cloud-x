export interface WordData {
  text: string
  value: number
}

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'am', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'it', 'its', 'that', 'this', 'these',
  'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'as', 'if', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 'just', 'my', 'your', 'his',
  'her', 'our', 'their', 'was', 'were', 'been', 'being', 'having'
])

export function generateWordCloud(text: string, limit: number = 80): WordData[] {
  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !COMMON_WORDS.has(word))

  // Count word frequencies
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  // Sort by frequency and convert to array
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => ({
      text,
      value: count
    }))

  return sortedWords
}

export function getColorByIndex(index: number, total: number): string {
  const hue = (index / total) * 360
  const saturation = 60 + (index % 20)
  const lightness = 40 + (index % 20)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
