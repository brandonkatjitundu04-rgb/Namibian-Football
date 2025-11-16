'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Ad {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  position: string
  page?: string
}

interface AdvertisementProps {
  position: 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'INLINE' | 'POPUP'
  className?: string
}

export function Advertisement({ position, className = '' }: AdvertisementProps) {
  const [ad, setAd] = useState<Ad | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const url = `/api/advertisements?position=${position}&page=${encodeURIComponent(pathname)}`
        console.log('Fetching ads from:', url)
        
        const res = await fetch(url)
        if (!res.ok) {
          console.error('Failed to fetch ads:', res.status, res.statusText)
          const errorText = await res.text()
          console.error('Error response:', errorText)
          return
        }
        const ads = await res.json()
        
        console.log(`Found ${Array.isArray(ads) ? ads.length : 0} ads for position ${position} on page ${pathname}`, ads)
        
        if (!Array.isArray(ads) || ads.length === 0) {
          console.log('No ads found or invalid response')
          return
        }
        
        // Filter: prefer page-specific ads, then general ads (page is null, empty, or undefined)
        const pageAd = ads.find((a: Ad) => {
          // Check if ad has a page and it matches current pathname
          return a.page && a.page.trim() !== '' && a.page === pathname
        })
        
        const generalAd = ads.find((a: Ad) => {
          // General ads have no page, empty page, or null page
          return !a.page || a.page === '' || a.page === null || a.page.trim() === ''
        })
        
        const selectedAd = pageAd || generalAd
        
        console.log('Selected ad:', selectedAd)
        
        if (selectedAd && selectedAd.imageUrl) {
          setAd(selectedAd)
        } else {
          console.log('No valid ad selected - missing imageUrl or no matching ad')
        }
      } catch (error) {
        console.error('Error fetching ad:', error)
      }
    }

    fetchAd()
  }, [position, pathname])

  if (!ad) return null

  const handleClick = async () => {
    if (ad.linkUrl) {
      try {
        await fetch(`/api/advertisements/${ad.id}/click`, { method: 'POST' })
      } catch (error) {
        console.error('Error tracking click:', error)
      }
    }
  }

  const adContent = (
    <div className={`relative ${className}`}>
      <Image
        src={ad.imageUrl}
        alt={ad.title}
        width={300}
        height={250}
        className="w-full h-auto rounded-lg object-cover"
      />
    </div>
  )

  if (ad.linkUrl) {
    return (
      <Link
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block"
      >
        {adContent}
      </Link>
    )
  }

  return adContent
}

