import { notFound } from 'next/navigation'
import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { ShareButtons } from '@/components/ShareButtons'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

// Revalidate every 5 minutes
export const revalidate = 300

async function getArticle(slug: string) {
  try {
    const article: any = await firestore.article.findBySlug(slug)
    
    if (!article || article.status !== 'PUBLISHED') {
      return null
    }
    
    // Fetch author profile if authorId exists
    if (article.authorId) {
      const author = await firestore.user.findById(article.authorId)
      if (author) {
        article.authorProfile = {
          name: author.name || article.author,
          email: author.email,
          profilePicture: author.profilePicture,
          bio: author.bio,
        }
      }
    }
    
    return article
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getRelatedArticles(currentSlug: string) {
  try {
    const articles = await firestore.article.findMany(
      { status: 'PUBLISHED' },
      { 
        orderBy: { publishedAt: 'desc' },
        take: 4,
      }
    )
    // Filter out current article
    return articles.filter(a => a.slug !== currentSlug).slice(0, 3)
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(params.slug)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back to News */}
      <Link 
        href="/news"
        className="inline-flex items-center text-accent-400 hover:text-accent-300 transition-colors mb-6"
      >
        ← Back to News
      </Link>

      {/* Article Header */}
      <article>
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
            
            {/* Author Profile */}
            {(article.authorProfile || article.author) && (
              <Card className="p-4 mb-6 bg-secondary-surface/30">
                <div className="flex items-start gap-4">
                  {article.authorProfile?.profilePicture ? (
                    <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={article.authorProfile.profilePicture}
                        alt={article.authorProfile.name || article.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-accent-400">
                        {(article.authorProfile?.name || article.author || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">
                        {article.authorProfile?.name || article.author}
                      </span>
                      <span className="text-muted">•</span>
                      <time dateTime={article.publishedAt?.toString()} className="text-muted text-sm">
                        {article.publishedAt ? format(new Date(article.publishedAt), 'MMMM d, yyyy') : ''}
                      </time>
                    </div>
                    {article.authorProfile?.bio && (
                      <p className="text-sm text-muted">{article.authorProfile.bio}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted leading-relaxed">{article.excerpt}</p>
            )}
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={article.featuredImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Video */}
          {article.videoUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
              <video
                src={article.videoUrl}
                controls
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {article.content}
            </div>
          </div>
        </Card>

        {/* Share Section */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-3">Share this article</h3>
          <ShareButtons title={article.title} excerpt={article.excerpt || undefined} />
        </Card>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link key={related.id} href={`/news/${related.slug}`}>
                <Card className="overflow-hidden hover:bg-secondary-surface/50 transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
                  {related.featuredImageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={related.featuredImageUrl}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold mb-2 line-clamp-2">{related.title}</h3>
                    {related.excerpt && (
                      <p className="text-muted text-sm mb-3 line-clamp-2 flex-1">{related.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted mt-auto pt-2 border-t border-secondary-surface">
                      <span>{related.author}</span>
                      <span>•</span>
                      <span>{related.publishedAt ? format(new Date(related.publishedAt), 'MMM d, yyyy') : ''}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

