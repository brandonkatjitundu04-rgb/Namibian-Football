'use client'

import { Button } from './ui/Button'

interface ShareButtonsProps {
  title: string
  excerpt?: string
}

export function ShareButtons({ title, excerpt }: ShareButtonsProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt || title,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    } else {
      // Fallback to copy link
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleShare}
        variant="outline"
        className="px-4 py-2"
      >
        Share
      </Button>
      <Button
        onClick={handleCopyLink}
        variant="outline"
        className="px-4 py-2"
      >
        Copy Link
      </Button>
    </div>
  )
}

