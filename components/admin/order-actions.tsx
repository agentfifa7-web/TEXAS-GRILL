'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { XCircle, Undo2 } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { cancelOrderAction, refundOrderAction } from '@/lib/actions/admin/orders'

export function OrderActions({ orderId, canRefund, isCancelled }: { orderId: string; canRefund: boolean; isCancelled: boolean }) {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmRefund, setConfirmRefund] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelOrderAction(orderId)
      if (result.ok) {
        toast.success('Commande annulée')
        setConfirmCancel(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleRefund() {
    startTransition(async () => {
      const result = await refundOrderAction(orderId)
      if (result.ok) {
        toast.success('Remboursement effectué')
        setConfirmRefund(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isCancelled && (
        <button type="button" onClick={() => setConfirmCancel(true)} className="btn btn-outline btn-sm text-destructive">
          <XCircle size={14} /> Annuler la commande
        </button>
      )}
      {canRefund && (
        <button type="button" onClick={() => setConfirmRefund(true)} className="btn btn-outline btn-sm">
          <Undo2 size={14} /> Rembourser
        </button>
      )}

      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Annuler cette commande ?">
        <p className="text-sm text-muted-foreground">
          Cette action passera la commande au statut « Annulée ». Elle sera journalisée dans l&apos;historique d&apos;audit.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmCancel(false)}>
            Retour
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={isPending} onClick={handleCancel}>
            Confirmer l&apos;annulation
          </button>
        </div>
      </Dialog>

      <Dialog open={confirmRefund} onClose={() => setConfirmRefund(false)} title="Rembourser cette commande ?">
        <p className="text-sm text-muted-foreground">
          Le paiement associé sera marqué comme remboursé auprès du fournisseur de paiement.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmRefund(false)}>
            Retour
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={isPending} onClick={handleRefund}>
            Confirmer le remboursement
          </button>
        </div>
      </Dialog>
    </div>
  )
}
