'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { PillTabs } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/checkbox'
import { VIDEO_CATEGORIES } from '@/lib/constants'
import {
  createStoryAction,
  toggleStoryActiveAction,
  deleteStoryAction,
  createVideoAction,
  togglePublishVideoAction,
  deleteVideoAction,
  type StoryInput,
  type VideoInput,
} from '@/lib/actions/admin/content'

export interface AdminStory {
  id: string
  title: string
  type: string
  mediaUrl: string
  caption: string | null
  isActive: boolean
}

export interface AdminVideo {
  id: string
  title: string
  slug: string
  category: string
  videoUrl: string
  thumbnailUrl: string
  isPublished: boolean
  viewCount: number
}

const TABS = [
  { value: 'stories' as const, label: 'Stories' },
  { value: 'videos' as const, label: 'Vidéos' },
]

export function ContentManager({ stories, videos }: { stories: AdminStory[]; videos: AdminVideo[] }) {
  const [tab, setTab] = useState<'stories' | 'videos'>('stories')

  return (
    <div className="flex flex-col gap-5">
      <PillTabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'stories' ? <StoriesPanel stories={stories} /> : <VideosPanel videos={videos} />}
    </div>
  )
}

function StoriesPanel({ stories }: { stories: AdminStory[] }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<StoryInput['type']>('PHOTO')
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createStoryAction({ title, type, mediaUrl, caption, isActive: true })
      if (result.ok) {
        toast.success('Story créée')
        setTitle('')
        setMediaUrl('')
        setCaption('')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      const result = await toggleStoryActiveAction(id, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteStoryAction(id)
      if (result.ok) toast.success('Story supprimée')
      else toast.error(result.error)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nouvelle story</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="storyTitle">Titre</Label>
              <Input id="storyTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="storyType">Type</Label>
              <Select id="storyType" value={type} onChange={(e) => setType(e.target.value as StoryInput['type'])}>
                <option value="PHOTO">Photo</option>
                <option value="VIDEO">Vidéo</option>
                <option value="NEWS">Actualité</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="mediaUrl">URL du média</Label>
              <Input id="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <div>
              <Label htmlFor="caption">Légende</Label>
              <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm mt-1" disabled={isPending}>
              <Plus size={14} /> Publier la story
            </button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stories.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <p className="font-bold">{s.title}</p>
                {s.caption && <p className="text-xs text-muted-foreground">{s.caption}</p>}
              </TableCell>
              <TableCell>{s.type}</TableCell>
              <TableCell>
                <Switch checked={s.isActive} disabled={isPending} onChange={(e) => handleToggle(s.id, e.target.checked)} />
              </TableCell>
              <TableCell className="text-right">
                <button type="button" onClick={() => handleDelete(s.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {stories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                Aucune story pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function VideosPanel({ videos }: { videos: AdminVideo[] }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<VideoInput['category']>('BEHIND_THE_GRILL')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createVideoAction({ title, slug, description, category, videoUrl, thumbnailUrl, isPublished: true })
      if (result.ok) {
        toast.success('Vidéo publiée')
        setTitle('')
        setSlug('')
        setDescription('')
        setVideoUrl('')
        setThumbnailUrl('')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      const result = await togglePublishVideoAction(id, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteVideoAction(id)
      if (result.ok) toast.success('Vidéo supprimée')
      else toast.error(result.error)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nouvelle vidéo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="videoTitle">Titre</Label>
              <Input id="videoTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="videoSlug">Slug</Label>
              <Input id="videoSlug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="videoDescription">Description</Label>
              <Input id="videoDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="videoCategory">Catégorie</Label>
              <Select id="videoCategory" value={category} onChange={(e) => setCategory(e.target.value as VideoInput['category'])}>
                {Object.entries(VIDEO_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="videoUrl">URL de la vidéo</Label>
              <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <div>
              <Label htmlFor="thumbnailUrl">URL de la miniature</Label>
              <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." required />
            </div>
            <button type="submit" className="btn btn-primary btn-sm mt-1" disabled={isPending}>
              <Plus size={14} /> Publier la vidéo
            </button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Vues</TableHead>
            <TableHead>Publiée</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <p className="font-bold">{v.title}</p>
                <p className="text-xs text-muted-foreground">/{v.slug}</p>
              </TableCell>
              <TableCell>{VIDEO_CATEGORIES[v.category as keyof typeof VIDEO_CATEGORIES] ?? v.category}</TableCell>
              <TableCell>{v.viewCount}</TableCell>
              <TableCell>
                <Switch checked={v.isPublished} disabled={isPending} onChange={(e) => handleToggle(v.id, e.target.checked)} />
              </TableCell>
              <TableCell className="text-right">
                <button type="button" onClick={() => handleDelete(v.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {videos.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucune vidéo pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
