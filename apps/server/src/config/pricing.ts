import { prisma } from '../lib/prisma';

export async function getPricing(path: string): Promise<{ priceUsdc: number; endpointId: string; path: string } | null> {
  try {
    const result = await prisma.endpoint.findFirst({
      where: {
        path,
        active: true
      }
    })
    if (!result) return null
    return {
      priceUsdc: result.priceUsdc,
      endpointId: result.id,
      path: result.path
    }
  } catch (error) {
    console.error('Database error in getPricing:', error)
    throw error
  }
}
