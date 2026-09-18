'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RESTAURANT_SERVICES, RESTAURANT_SERVICE_LABELS } from '@/lib/constants'
import { createRestaurantAction, updateRestaurantAction, type RestaurantFormInput } from '@/lib/actions/admin/restaurants'

export interface RestaurantFormValues {
  id?: string
  slug: string
  name: string
  description: string
  phone: string
  email: string
  address: string
  city: string
  lat: string
  lng: string
  status: string
  services: string[]
  heroImage: string
  gallery: string
}

export function RestaurantForm({ initial }: { initial: RestaurantFormValues }) {
  const router = useRouter()
  const [values, setValues] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof RestaurantFormValues>(key: K, value: RestaurantFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function toggleService(service: string) {
    set('services', values.services.includes(service) ? values.services.filter((s) => s !== service) : [...values.services, service])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const input: RestaurantFormInput = {
      slug: values.slug,
      name: values.name,
      description: values.description,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      lat: values.lat ? Number(values.lat) : null,
      lng: values.lng ? Number(values.lng) : null,
      status: values.status as RestaurantFormInput['status'],
      services: values.services,
      heroImage: values.heroImage,
      gallery: values.gallery
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    startTransition(async () => {
      const result = values.id ? await updateRestaurantAction(values.id, input) : await createRestaurantAction(input)
      if (!result) return // redirect() thrown on create success
      if (result.ok) {
        toast.success('Restaurant enregistré')
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
            <Textarea id="description" value={values.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={values.address} onChange={(e) => set('address', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={values.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select id="status" value={values.status} onChange={(e) => set('status', e.target.value)}>
              <option value="OPEN">Ouvert</option>
              <option value="CLOSED">Fermé</option>
              <option value="COMING_SOON">Bientôt disponible</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input id="lat" type="number" step="any" value={values.lat} onChange={(e) => set('lat', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input id="lng" type="number" step="any" value={values.lng} onChange={(e) => set('lng', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {RESTAURANT_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm font-medium">
              <Checkbox checked={values.services.includes(s)} onChange={() => toggleService(s)} />
              {RESTAURANT_SERVICE_LABELS[s]}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Médias</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="heroImage">Image principale (URL)</Label>
            <Input id="heroImage" value={values.heroImage} onChange={(e) => set('heroImage', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="gallery">Galerie (URLs séparées par des virgules)</Label>
            <Textarea id="gallery" value={values.gallery} onChange={(e) => set('gallery', e.target.value)} placeholder="https://..., https://..." />
          </div>
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
