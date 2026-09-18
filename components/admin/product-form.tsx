'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProductAction, updateProductAction, type ProductFormInput } from '@/lib/actions/admin/products'

export interface ProductFormValues {
  id?: string
  slug: string
  name: string
  description: string
  price: string
  compareAtPrice: string
  categoryId: string
  restaurantId: string
  images: string
  ingredients: string
  allergens: string
  isAvailable: boolean
  isFeatured: boolean
  isNew: boolean
  badge: string
  sortOrder: string
}

export function ProductForm({
  initial,
  categories,
  restaurants,
}: {
  initial: ProductFormValues
  categories: { id: string; name: string }[]
  restaurants: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function splitList(value: string) {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const input: ProductFormInput = {
      slug: values.slug,
      name: values.name,
      description: values.description,
      price: Number(values.price) || 0,
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
      categoryId: values.categoryId,
      restaurantId: values.restaurantId,
      images: splitList(values.images),
      ingredients: splitList(values.ingredients),
      allergens: splitList(values.allergens),
      isAvailable: values.isAvailable,
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      badge: values.badge,
      sortOrder: Number(values.sortOrder) || 0,
    }

    startTransition(async () => {
      const result = values.id ? await updateProductAction(values.id, input) : await createProductAction(input)
      if (!result) return
      if (result.ok) {
        toast.success('Produit enregistré')
        router.refresh()
      } else {
        toast.error(result.error)
        if (result.fieldErrors) setErrors(result.fieldErrors as unknown as Record<string, string>)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={values.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={values.slug} onChange={(e) => set('slug', e.target.value)} required />
            {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={values.description} onChange={(e) => set('description', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input id="price" type="number" min={0} value={values.price} onChange={(e) => set('price', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Prix barré (optionnel)</Label>
            <Input id="compareAtPrice" type="number" min={0} value={values.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="categoryId">Catégorie</Label>
            <Select id="categoryId" value={values.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
              <option value="">Sélectionner…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="restaurantId">Restaurant (optionnel)</Label>
            <Select id="restaurantId" value={values.restaurantId} onChange={(e) => set('restaurantId', e.target.value)}>
              <option value="">Tous les restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="badge">Badge (optionnel)</Label>
            <Input id="badge" value={values.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Ex : Best-seller" />
          </div>
          <div>
            <Label htmlFor="sortOrder">Ordre d&apos;affichage</Label>
            <Input id="sortOrder" type="number" value={values.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médias & détails</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="images">Images (URLs séparées par des virgules)</Label>
            <Textarea id="images" value={values.images} onChange={(e) => set('images', e.target.value)} placeholder="https://..., https://..." />
          </div>
          <div>
            <Label htmlFor="ingredients">Ingrédients (séparés par des virgules)</Label>
            <Input id="ingredients" value={values.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="allergens">Allergènes (séparés par des virgules)</Label>
            <Input id="allergens" value={values.allergens} onChange={(e) => set('allergens', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Options et suppléments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Options et suppléments : gérés via le seed pour cette démo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilité</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          <label className="flex items-center gap-3 text-sm font-bold">
            <Switch checked={values.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} />
            Disponible
          </label>
          <label className="flex items-center gap-3 text-sm font-bold">
            <Switch checked={values.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
            Mis en avant
          </label>
          <label className="flex items-center gap-3 text-sm font-bold">
            <Switch checked={values.isNew} onChange={(e) => set('isNew', e.target.checked)} />
            Nouveau
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          <Save size={16} /> {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
