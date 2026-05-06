import { prisma } from '../lib/prisma';

export async function getPricing(path: string): Promise<{ priceUsdc: number; endpointId: string; path: string } | null> {
  console.log('Looking for endpoint:', path)
  try {
    const result = await prisma.endpoint.findFirst({
      where: {
        path,
        active: true
      }
    })
    console.log('Found:', result)
    if (!result) return null
    return {
      priceUsdc: result.priceUsdc,
      endpointId: result.id,
      path: result.path
    }
  } catch (error) {
    console.error('Database error in getPricing:', error)
    return null
  }
}
