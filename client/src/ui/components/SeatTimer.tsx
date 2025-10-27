import React from 'react'

export default function SeatTimer({ selected, onExpire }: { selected: string[], onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
  
  React.useEffect(() => {
    // Only start timer when seats are selected
    if (selected.length === 0) {
      setTimeLeft(null)
      return
    }

    // Start 5 minute timer when first seat is selected
    if (timeLeft === null) {
      setTimeLeft(5 * 60) // 5 minutes in seconds
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(timer)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selected.length, timeLeft])

  if (!timeLeft) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="text-sm">
      Giữ ghế: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}