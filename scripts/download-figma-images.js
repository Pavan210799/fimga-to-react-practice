import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * Downloads photos (IMAGE fills) and SVG icons from Figma.
 *
 * Mentor's script only printed GET /v1/files/:id/images.
 * This one also saves files to disk.
 *
 * API calls (keep this low):
 *   1. GET /v1/files/:id/images     → URL map for image fills
 *   2. GET /v1/images/:id?ids=...   → SVG render for unique icons
 *
 * Image bytes come from S3 URLs, not extra Figma API calls.
 *
 * Run once:
 *   node scripts/download-figma-images.js
 */

const token = process.env.FIGMA_TOKEN || process.env.VITE_FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID || process.env.VITE_FIGMA_FILE_ID;
const nodeId = process.env.FIGMA_NODE_ID || "2683:6274";

const JSON_PATH = "./figma-node.json";
const IMAGE_DIR = "./src/assets/images";
const ICON_DIR = "./src/assets/icons";

if (!token || !fileId) {
  console.error("Missing FIGMA_TOKEN or FIGMA_FILE_ID in .env");
  process.exit(1);
}

if (!fs.existsSync(JSON_PATH)) {
  console.error("figma-node.json not found. Run fetch-figma.js once first.");
  process.exit(1);
}

function slug(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "asset"
  );
}

function collectAssets(root) {
  const imageFills = [];
  const iconNodes = [];

  function walk(node) {
    if (!node || node.visible === false) return;

    for (const fill of node.fills || []) {
      if (fill.type === "IMAGE" && fill.imageRef) {
        imageFills.push({
          id: node.id,
          name: node.name,
          imageRef: fill.imageRef,
        });
      }
    }

    const lower = (node.name || "").toLowerCase();
    const isIcon =
      (node.type === "INSTANCE" || node.type === "COMPONENT") &&
      (lower.includes("vuesax") ||
        lower.includes("icon") ||
        lower.includes("arrow") ||
        lower.includes("search") ||
        lower.includes("bookmark") ||
        lower.includes("upload") ||
        lower.includes("add"));

    if (isIcon) {
      iconNodes.push({
        id: node.id,
        name: node.name,
      });
    }

    // Logo group (vectors, not an image fill)
    if (lower.includes("random symboles") || lower === "logo") {
      iconNodes.push({
        id: node.id,
        name: node.name,
      });
    }

    (node.children || []).forEach(walk);
  }

  walk(root);

  const uniqueRefs = new Map();
  for (const item of imageFills) {
    if (!uniqueRefs.has(item.imageRef)) {
      uniqueRefs.set(item.imageRef, item);
    }
  }

  const uniqueIcons = new Map();
  for (const item of iconNodes) {
    const key = slug(item.name);
    if (!uniqueIcons.has(key)) {
      uniqueIcons.set(key, item);
    }
  }

  return {
    imageFills: [...uniqueRefs.values()],
    icons: [...uniqueIcons.values()],
  };
}

async function downloadBuffer(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

function extensionFromUrl(url) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".svg")) return "svg";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "jpg";
  if (clean.endsWith(".webp")) return "webp";
  return "png";
}

async function main() {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  const page = data.nodes[nodeId]?.document;

  if (!page) {
    console.error(`Node ${nodeId} not in figma-node.json`);
    process.exit(1);
  }

  const { imageFills, icons } = collectAssets(page);

  console.log("From figma-node.json (local, no API):");
  console.log(`  Unique photos: ${imageFills.length}`);
  console.log(`  Unique icons:  ${icons.length}`);

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  fs.mkdirSync(ICON_DIR, { recursive: true });

  const headers = { "X-Figma-Token": token };
  const manifest = { images: {}, icons: {} };

  // --- API call 1: image-fill URL map ---
  console.log("\nFigma API 1/2: GET /v1/files/:id/images");
  const imageMapRes = await axios.get(
    `https://api.figma.com/v1/files/${fileId}/images`,
    { headers }
  );

  const urlMap = imageMapRes.data?.meta?.images || {};

  for (const item of imageFills) {
    const url = urlMap[item.imageRef];
    if (!url) {
      console.warn(`  Missing URL for ${item.name} (${item.imageRef})`);
      continue;
    }

    const ext = extensionFromUrl(url);
    const filename = `${slug(item.name)}-${item.imageRef.slice(0, 8)}.${ext}`;
    const outPath = path.join(IMAGE_DIR, filename);

    const buffer = await downloadBuffer(url);
    fs.writeFileSync(outPath, buffer);
    manifest.images[item.imageRef] = outPath.replace(/^\.\//, "");
    console.log(`  saved ${filename}`);
  }

  // --- API call 2: render unique icons as SVG ---
  if (icons.length) {
    const ids = icons.map((icon) => icon.id).join(",");
    console.log("\nFigma API 2/2: GET /v1/images/:id (svg icons)");

    const iconRes = await axios.get(`https://api.figma.com/v1/images/${fileId}`, {
      headers,
      params: {
        ids,
        format: "svg",
      },
    });

    const iconUrls = iconRes.data?.images || {};

    for (const icon of icons) {
      const url = iconUrls[icon.id];
      if (!url) {
        console.warn(`  Missing SVG for ${icon.name} (${icon.id})`);
        continue;
      }

      const filename = `${slug(icon.name)}.svg`;
      const outPath = path.join(ICON_DIR, filename);
      const buffer = await downloadBuffer(url);
      fs.writeFileSync(outPath, buffer);
      manifest.icons[icon.name] = outPath.replace(/^\.\//, "");
      console.log(`  saved ${filename}`);
    }
  }

  fs.writeFileSync(
    "./src/assets/manifest.json",
    JSON.stringify(manifest, null, 2)
  );

  console.log("\nDone. Assets in src/assets/images and src/assets/icons");
  console.log("Do not run this again unless Figma images changed.");
}

main().catch((error) => {
  console.error(
    "API Error:",
    error.response?.status,
    error.response?.data || error.message
  );
  process.exit(1);
});
