'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fill,
  className,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src || '/placeholder.png')
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <div
        className={`bg-secondary-surface flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-muted text-sm">No Image</span>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}

