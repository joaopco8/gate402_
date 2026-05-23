import sharp from 'sharp'
import { statSync } from 'fs'

const images = [
  { input: 'public/IMG-TELA.png',                 output: 'public/IMG-TELA.webp',                 width: 1920 },
  { input: 'public/img-hero.png',                 output: 'public/img-hero.webp',                 width: 1200 },
  { input: 'public/logo-gate.png',                output: 'public/logo-gate.webp',                width: 300  },
  { input: 'public/logos/superteam-logo.png',     output: 'public/logos/superteam-logo.webp',     width: 400  },
  { input: 'public/faq-img.jpg',                  output: 'public/faq-img.webp',                  width: 800  },
  { input: 'public/IMG-BG-SC.jpg',               output: 'public/IMG-BG-SC.webp',               width: 1920 },
  { input: 'public/logos/cloudflare.png',         output: 'public/logos/cloudflare.webp',         width: 200  },
  { input: 'public/logos/coinbase.png',           output: 'public/logos/coinbase.webp',           width: 200  },
  { input: 'public/logos/google.png',             output: 'public/logos/google.webp',             width: 200  },
  { input: 'public/logos/solana.png',             output: 'public/logos/solana.webp',             width: 200  },
  { input: 'public/logos/anthropic.png',          output: 'public/logos/anthropic.webp',          width: 200  },
  { input: 'public/logos/phantom.png',            output: 'public/logos/phantom.webp',            width: 200  },
  { input: 'public/logos/stripe.png',             output: 'public/logos/stripe.webp',             width: 200  },
]

for (const img of images) {
  try {
    await sharp(img.input).resize(img.width).webp({ quality: 80 }).toFile(img.output)
    const before = statSync(img.input).size
    const after  = statSync(img.output).size
    const saved  = Math.round((1 - after / before) * 100)
    console.log(`✓ ${img.output} — ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB (${saved}% smaller)`)
  } catch (e) {
    console.warn(`⚠ skipped ${img.input}: ${e.message}`)
  }
}
