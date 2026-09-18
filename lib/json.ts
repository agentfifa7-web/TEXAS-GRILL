// Tiny helpers around the JSON-encoded columns used throughout schema.prisma
// (SQLite has no native array/enum type — see the schema header comment).
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null)
}
