// Generates the three PWA icons (icon-192.png, icon-512.png, icon-maskable.png)
// from the canonical source SVG: public/icons/source.svg
//
// Usage:
//   npm install --save-dev sharp
//   node scripts/generate-pwa-icons.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "public/icons/source.svg");
const OUT_DIR = resolve(ROOT, "public/icons");

const BG = "#fdf7e8"; // matches manifest.background_color

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.error(
      "sharp is not installed. Run: npm install --save-dev sharp"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const svg = await readFile(SRC);

  // any-purpose icons: full-bleed logo on brand background
  for (const size of [192, 512]) {
    const buf = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG,
      },
    })
      .composite([
        {
          input: await sharp(svg).resize(size, size, { fit: "contain", background: BG }).png().toBuffer(),
        },
      ])
      .png()
      .toBuffer();
    await writeFile(resolve(OUT_DIR, `icon-${size}.png`), buf);
    console.log(`wrote icon-${size}.png`);
  }

  // maskable: logo at 80% inside 512x512, centered, on brand background
  const maskSize = 512;
  const inner = Math.round(maskSize * 0.8);
  const innerPng = await sharp(svg)
    .resize(inner, inner, { fit: "contain", background: BG })
    .png()
    .toBuffer();
  const maskable = await sharp({
    create: {
      width: maskSize,
      height: maskSize,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      {
        input: innerPng,
        top: Math.round((maskSize - inner) / 2),
        left: Math.round((maskSize - inner) / 2),
      },
    ])
    .png()
    .toBuffer();
  await writeFile(resolve(OUT_DIR, "icon-maskable.png"), maskable);
  console.log("wrote icon-maskable.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
