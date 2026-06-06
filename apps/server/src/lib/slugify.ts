export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

export async function ensureUniqueSlug(
  prisma: any,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug
  let attempt = 0

  while (true) {
    const existing = await prisma.proxyEndpoint.findUnique({ where: { slug } })
    if (!existing) return slug
    attempt++
    slug = `${baseSlug}-${attempt}`
  }
}
