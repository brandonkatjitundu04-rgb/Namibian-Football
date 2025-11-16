import { firestore } from '@/lib/firestore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { format } from 'date-fns'

async function getArticles() {
  const articles = await firestore.article.findMany(
    undefined,
    { orderBy: { createdAt: 'desc' } }
  )
  return articles as any[]
}

export default async function ArticlesAdminPage() {
  const articles = await getArticles()

  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: 'bg-green-500/20 text-green-400 border-green-500/30',
      DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl ml-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Manage News Articles</h1>
        <Link href="/admin/articles/new">
          <Button>Add New Article</Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-surface">
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Title</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-muted">Author</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Status</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Published</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    No articles yet. Create your first article!
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-secondary-surface/50 hover:bg-secondary-surface/30 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="py-3 px-2">{article.author}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {article.publishedAt
                        ? format(new Date(article.publishedAt), 'MMM d, yyyy')
                        : '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {article.status === 'PUBLISHED' && (
                          <Link href={`/news/${article.slug}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

