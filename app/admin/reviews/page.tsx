import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { ReviewCard, type AdminReview } from '@/components/admin/review-card'

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'reviews:manage')) return <AccessDenied />

  const reviews = await prisma.review.findMany({
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })

  const rows: AdminReview[] = reviews.map((r) => ({
    id: r.id,
    userName: r.user.name,
    productName: r.product?.name ?? null,
    overallRating: r.overallRating,
    comment: r.comment,
    status: r.status,
    adminReply: r.adminReply,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Réputation</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Avis <span className="text-fire">clients.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rows.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
        {rows.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground lg:col-span-2">Aucun avis pour le moment.</p>}
      </div>
    </div>
  )
}
