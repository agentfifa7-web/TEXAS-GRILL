import { CreditCard, Info, Smartphone, Wallet, type LucideIcon } from 'lucide-react'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'

type PaymentMethodKey = keyof typeof PAYMENT_METHOD_LABELS

const METHOD_ICONS: Record<PaymentMethodKey, LucideIcon> = {
  MOBILE_MONEY: Smartphone,
  CARD: CreditCard,
  CASH: Wallet,
}

const METHOD_DESCRIPTIONS: Record<PaymentMethodKey, string> = {
  MOBILE_MONEY: 'Orange Money, MTN Money, Moov Money, Wave — paiement instantané à la commande.',
  CARD: 'Visa, Mastercard — paiement sécurisé en ligne.',
  CASH: 'Règle en espèces directement auprès du livreur ou sur place.',
}

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodKey[]

export default function AccountPaymentMethodsPage() {
  return (
    <div>
      <p className="eyebrow">Paiement</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Moyens de <span className="text-fire">paiement.</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {METHODS.map((method) => {
          const Icon = METHOD_ICONS[method]
          return (
            <div key={method} className="card-grill p-5">
              <Icon size={22} className="text-fire" />
              <p className="mt-3 font-display text-lg uppercase">{PAYMENT_METHOD_LABELS[method]}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{METHOD_DESCRIPTIONS[method]}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Info size={18} className="mt-0.5 shrink-0 text-fire" />
        <p>
          Les moyens de paiement sont choisis à chaque commande lors du checkout. L&apos;enregistrement de moyens de paiement récurrents sera
          disponible avec l&apos;intégration d&apos;un fournisseur de paiement réel (voir{' '}
          <code className="rounded bg-border/60 px-1 py-0.5 text-xs">PAYMENT_PROVIDER</code> dans .env.example).
        </p>
      </div>
    </div>
  )
}
