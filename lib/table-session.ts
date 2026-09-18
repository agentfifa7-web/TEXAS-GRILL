'use client'

// Lightweight client-side session for the QR "commande sur place" flow —
// scanning a table's QR code stores which table the visitor is sitting at,
// so the checkout wizard can skip restaurant/address selection entirely.
const KEY = 'tg_table_session'

export interface TableSessionData {
  tableId: string
  tableNumber: number
  restaurantId: string
  restaurantName: string
}

export function setTableSession(data: TableSessionData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

export function getTableSession(): TableSessionData | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TableSessionData) : null
  } catch {
    return null
  }
}

export function clearTableSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
