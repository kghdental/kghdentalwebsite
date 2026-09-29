import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function createIco(images) {
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map((img) => img.buffer)]);
}

async function buildAllFavicons() {
  const trimmed = await sharp('public/images/logos/kgh-logo-transparent.png').trim().toBuffer();

  // High-res logo scaled to fit inside 512x512 squircle
  const logoInside = await sharp(trimmed)
    .resize(455, 455, { fit: 'inside' })
    .toBuffer();

  const svgSquircle = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512">
      <rect x="8" y="8" width="496" height="496" rx="96" ry="96" fill="#ffffff" stroke="#e4e4e7" stroke-width="8"/>
    </svg>
  `);

  const master512 = await sharp(svgSquircle)
    .composite([{ input: logoInside, gravity: 'center' }])
    .png()
    .toBuffer();

  // Generate PNG sizes
  const png16 = await sharp(master512).resize(16, 16).png().toBuffer();
  const png32 = await sharp(master512).resize(32, 32).png().toBuffer();
  const png48 = await sharp(master512).resize(48, 48).png().toBuffer();
  const png180 = await sharp(master512).resize(180, 180).png().toBuffer();
  const png192 = await sharp(master512).resize(192, 192).png().toBuffer();

  // Create ICO
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  // Write to src/app and public
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/icon.png', master512);
  fs.writeFileSync('src/app/apple-icon.png', png180);

  // Write helper files to public/images/logos
  fs.writeFileSync('public/images/logos/favicon-16x16.png', png16);
  fs.writeFileSync('public/images/logos/favicon-32x32.png', png32);
  fs.writeFileSync('public/images/logos/apple-touch-icon.png', png180);
  fs.writeFileSync('public/images/logos/kgh-favicon-512.png', master512);

  // Clean up temporary test files
  const testFiles = [
    'public/test-favicon-white.png',
    'public/test-favicon-trans.png',
    'public/test-favicon-circle.png',
    'public/test-32-white.png',
    'public/test-64-white.png',
    'public/test-32-circle.png',
    'public/test-64-circle.png',
    'public/test-on-dark-tab.png',
    'public/test-favicon-squircle.png',
    'public/test-squircle-on-dark.png',
  ];
  for (const tf of testFiles) {
    if (fs.existsSync(tf)) fs.unlinkSync(tf);
  }

  console.log('All favicons successfully generated and installed!');
}

buildAllFavicons().catch(console.error);
