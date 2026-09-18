import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Plus, Pencil } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { ProductAvailabilityToggle } from '@/components/admin/product-availability-toggle'
import { ProductDeleteButton } from '@/components/admin/product-delete-button'
import { formatXOF } from '@/lib/constants'

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'products:manage')) return <AccessDenied />

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="display-heading text-4xl sm:text-5xl">
            Les <span className="text-fire">produits.</span>
          </h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus size={16} /> Nouveau produit
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            let images: string[] = []
            try {
              images = JSON.parse(p.imagesJson)
            } catch {
              images = []
            }
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {images[0] && <Image src={images[0]} alt={p.name} fill className="object-cover" sizes="40px" />}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-bold">{p.name}</p>
                  <div className="mt-0.5 flex gap-1">
                    {p.isFeatured && <Badge variant="amber">Mis en avant</Badge>}
                    {p.isNew && <Badge variant="outline">Nouveau</Badge>}
                  </div>
                </TableCell>
                <TableCell>{p.category.name}</TableCell>
                <TableCell className="price-tag">{formatXOF(p.price)}</TableCell>
                <TableCell>
                  <ProductAvailabilityToggle id={p.id} initial={p.isAvailable} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/products/${p.id}/edit`} aria-label="Modifier" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-fire">
                      <Pencil size={16} />
                    </Link>
                    <ProductDeleteButton id={p.id} name={p.name} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
