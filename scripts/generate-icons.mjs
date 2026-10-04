// One-off: builds the favicon / app icon set in public/ from the 1080×1080 source mark,
// plus the default social preview image (og-image.jpg) from the logo.
// Run after changing the source: node scripts/generate-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'design/assets/favicon-source.png'
const OUT = 'public'
const BEIGE = '#e8e2d0'

// Tiny sizes: trim part of the beige margin so the L stays readable in a browser tab
const TRIM = { left: 81, top: 81, width: 918, height: 918 }

const png = (size, { trim = false } = {}) => {
  const img = sharp(SOURCE)
  if (trim) img.extract(TRIM)
  return img.resize(size, size, { kernel: 'lanczos3' }).flatten({ background: BEIGE }).png({ compressionLevel: 9 })
}

// All icons are opaque (iOS fills transparency with black).
// Maskable: Android crops to a circle/squircle, keep the mark inside the 80% safe zone
async function maskable(size) {
  const inner = Math.round(size * 0.76)
  const mark = await sharp(SOURCE).resize(inner, inner).png().toBuffer()
  const canvas = await sharp({ create: { width: size, height: size, channels: 3, background: BEIGE } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer()
  // composite always adds an alpha channel; drop it in a second pass
  return sharp(canvas).removeAlpha().png({ compressionLevel: 9 })
}

// Social preview (Facebook, Viber, WhatsApp): the wordmark logo centred on beige, 1200×630
async function ogImage() {
  const logo = await sharp('public/assets/img/logo.svg', { density: 300 }).resize({ width: 760 }).png().toBuffer()
  return sharp({ create: { width: 1200, height: 630, channels: 3, background: BEIGE } })
    .composite([{ input: logo, gravity: 'center' }])
    .jpeg({ quality: 88, mozjpeg: true })
}

// .ico with PNG entries (supported by every current browser)
async function ico(sizes) {
  const images = await Promise.all(sizes.map(s => png(s, { trim: true }).toBuffer()))
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach((data, i) => {
    const entry = 6 + 16 * i
    const s = sizes[i]
    header.writeUInt8(s >= 256 ? 0 : s, entry) // width
    header.writeUInt8(s >= 256 ? 0 : s, entry + 1) // height
    header.writeUInt8(0, entry + 2) // palette
    header.writeUInt8(0, entry + 3) // reserved
    header.writeUInt16LE(1, entry + 4) // color planes
    header.writeUInt16LE(32, entry + 6) // bits per pixel
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images])
}

await Promise.all([
  ico([16, 32, 48]).then(buf => writeFile(`${OUT}/favicon.ico`, buf)),
  png(16, { trim: true }).toFile(`${OUT}/favicon-16x16.png`),
  png(32, { trim: true }).toFile(`${OUT}/favicon-32x32.png`),
  png(96).toFile(`${OUT}/favicon-96x96.png`),
  png(180).toFile(`${OUT}/apple-touch-icon.png`),
  png(192).toFile(`${OUT}/web-app-manifest-192x192.png`),
  png(512).toFile(`${OUT}/web-app-manifest-512x512.png`),
  maskable(512).then(img => img.toFile(`${OUT}/web-app-manifest-maskable-512x512.png`)),
  ogImage().then(img => img.toFile(`${OUT}/og-image.jpg`)),
])

console.log('Icons written to public/')
