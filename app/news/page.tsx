'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Advertisement } from '@/components/Advertisement'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles?status=PUBLISHED')
        const data = await res.json()
        setArticles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-muted">Loading news...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Latest News</h1>
        <p className="text-muted text-lg">Stay updated with the latest news from Namibian football</p>
      </div>

      {/* Sidebar Advertisement */}
      <div className="mb-8 flex justify-end">
        <div className="w-64">
          <Advertisement position="SIDEBAR" />
        </div>
      </div>

      {articles.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted text-lg">No news articles available yet. Check back soon!</p>
        </Card>
      ) : (
        <>
          {/* Featured Article (First one) */}
          {articles.length > 0 && (
            <Link href={`/news/${articles[0].slug}`}>
              <Card className="mb-8 overflow-hidden hover:bg-secondary-surface/50 transition-all cursor-pointer">
                <div className="grid md:grid-cols-2 gap-6">
                  {articles[0].featuredImageUrl && (
                    <div className="relative h-64 md:h-auto">
                      <Image
                        src={articles[0].featuredImageUrl}
                        alt={articles[0].title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 flex flex-col justify-center ${!articles[0].featuredImageUrl ? 'md:col-span-2' : ''}`}>
                    <div className="mb-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-accent-400/20 text-accent-400 border border-accent-400/30">
                        Featured
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">{articles[0].title}</h2>
                    {articles[0].excerpt && (
                      <p className="text-muted text-lg mb-4 line-clamp-3">{articles[0].excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span>{articles[0].author}</span>
                      <span>•</span>
                      <span>{articles[0].publishedAt ? format(new Date(articles[0].publishedAt), 'MMMM d, yyyy') : ''}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {/* Rest of the Articles */}
          {articles.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(1).map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`}>
                  <Card className="overflow-hidden hover:bg-secondary-surface/50 transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
                    {article.featuredImageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={article.featuredImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-muted text-sm mb-3 line-clamp-3 flex-1">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted mt-auto pt-3 border-t border-secondary-surface">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : ''}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

