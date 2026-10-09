// Genera los iconos PNG de la PWA (192/512/maskable/apple-touch) y un
// favicon.ico real, sin dependencias externas (usa node:zlib para codificar PNG).
// Uso: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
mkdirSync(iconsDir, { recursive: true });

// ── CRC32 (para chunks PNG) ──────────────────────────────
const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// ── Logo LOCALIS AI (fondo oscuro + anillo degradado + punto) ──
const BG = [11, 15, 23, 255]; // #0B0F17
const CYAN = [0, 242, 254, 255]; // #00F2FE
const COBALT = [59, 130, 246, 255]; // #3B82F6

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function buildLogo(size, maskable = false) {
  const rgba = Buffer.alloc(size * size * 4, 0);
  const c = size / 2;
  const ringR = size * (maskable ? 0.245 : 0.30);
  const thick = size * (maskable ? 0.055 : 0.07);
  const dotR = size * (maskable ? 0.085 : 0.105);
  const corner = size * 0.22; // esquinas redondeadas del fondo
  const setPx = (x, y, col) => {
    const i = (y * size + x) * 4;
    rgba[i] = col[0];
    rgba[i + 1] = col[1];
    rgba[i + 2] = col[2];
    rgba[i + 3] = col[3];
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // fondo con esquinas redondeadas
      let col = BG;
      const inCorner = (px, py) => {
        const cc = corner;
        const dx = px < cc ? cc - px : px > size - 1 - cc ? px - (size - 1 - cc) : 0;
        const dy = py < cc ? cc - py : py > size - 1 - cc ? py - (size - 1 - cc) : 0;
        return Math.hypot(dx, dy) > cc;
      };
      if (inCorner(x, y)) col = [0, 0, 0, 0];
      const dx = x - c + 0.5;
      const dy = y - c + 0.5;
      const d = Math.hypot(dx, dy);
      if (d < dotR) {
        col = CYAN;
      } else if (d <= ringR && d >= ringR - thick) {
        const t = Math.min(1, Math.max(0, (x + y) / (2 * size)));
        col = [lerp(CYAN[0], COBALT[0], t), lerp(CYAN[1], COBALT[1], t), lerp(CYAN[2], COBALT[2], t), 255];
      }
      setPx(x, y, col);
    }
  }
  return rgba;
}

function writePng(name, size, maskable = false) {
  const png = encodePNG(size, size, buildLogo(size, maskable));
  const out = join(iconsDir, name);
  writeFileSync(out, png);
  console.log(`✓ ${name} (${size}x${size}) ${png.length} bytes`);
}

// ── favicon.ico (PNG 32x32 embebido en contenedor ICO) ──
function writeIco(name, size) {
  const png = encodePNG(size, size, buildLogo(size, false));
  const dir = Buffer.alloc(22);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(1, 4); // count
  dir.writeUInt8(size >= 256 ? 0 : size, 6); // width
  dir.writeUInt8(size >= 256 ? 0 : size, 7); // height
  dir.writeUInt8(0, 8); // colors
  dir.writeUInt8(0, 9); // reserved
  dir.writeUInt16LE(1, 10); // planes
  dir.writeUInt16LE(32, 12); // bitcount
  dir.writeUInt32LE(png.length, 14); // bytes in resource
  dir.writeUInt32LE(22, 18); // image offset
  const ico = Buffer.concat([dir, png]);
  const out = join(__dirname, "..", "public", name);
  writeFileSync(out, ico);
  console.log(`✓ ${name} (ico ${size}x${size}) ${ico.length} bytes`);
}

writePng("icon-192.png", 192);
writePng("icon-512.png", 512);
writePng("icon-maskable-512.png", 512, true);
writePng("apple-touch-icon.png", 180);
writeIco("favicon.ico", 32);
console.log("Iconos generados en public/");
