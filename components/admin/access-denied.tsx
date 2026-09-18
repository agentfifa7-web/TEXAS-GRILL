import { ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function AccessDenied() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <ShieldAlert size={40} className="text-destructive" />
        <p className="font-display text-2xl uppercase tracking-wide">Accès refusé</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Votre rôle ne dispose pas des permissions nécessaires pour consulter cette page. Contactez un
          administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      </CardContent>
    </Card>
  )
}
