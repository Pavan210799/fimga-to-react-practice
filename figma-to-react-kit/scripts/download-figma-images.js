import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * API CALLS 2 and 3 of 3
 *
 *   2. GET /v1/files/:id/images        → URL map for IMAGE fills (photos)
 *   3. GET /v1/images/:id?format=svg   → SVG URLs for unique icons
 *
 * PNG/SVG bytes are then downloaded from those URLs (S3). That is not a Figma API call.
 *
 * Requires figma-node.json from fetch-figma.js.
 * Run ONCE. Do not re-run unless Figma images changed.
 *
 *   node scripts/download-figma-images.js
 */

// ---------------------------------------------------------------------------
// CHANGE PER PROJECT
// ---------------------------------------------------------------------------

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;
const nodeId = process.env.FIGMA_NODE_ID;

/**
 * Layer-name words that mean "export this node as an SVG icon".
 * Inspect first (node scripts/inspect-figma.js Header) and add words you see
 * on icon instances: "vuesax", "arrow", your logo group name, etc.
 *
 * Matching is case-insensitive on INSTANCE / COMPONENT names.
 * Extra: any node whose name includes these strings is also exported.
 */
const ICON_NAME_HINTS = [
  "icon",
  "logo",
  "arrow",
  "search",
  "bookmark",
  "upload",
  "add",
  "vuesax",
];

const JSON_PATH = "./figma-node.json";
const IMAGE_DIR = "./src/assets/images";
const ICON_DIR = "./src/assets/icons";
const MANIFEST_PATH = "./src/assets/manifest.json";

// ---------------------------------------------------------------------------

if (!token || !fileId || !nodeId) {
  console.error("Set FIGMA_TOKEN, FIGMA_FILE_ID, and FIGMA_NODE_ID in .env");
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

function nameLooksLikeIcon(name) {
  const lower = (name || "").toLowerCase();
  return ICON_NAME_HINTS.some((hint) => lower.includes(hint.toLowerCase()));
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

    const isComponentLike =
      node.type === "INSTANCE" || node.type === "COMPONENT" || node.type === "GROUP";

    if (isComponentLike && nameLooksLikeIcon(node.name)) {
      iconNodes.push({ id: node.id, name: node.name });
    }

    (node.children || []).forEach(walk);
  }

  walk(root);

  const uniqueRefs = new Map();
  for (const item of imageFills) {
    if (!uniqueRefs.has(item.imageRef)) uniqueRefs.set(item.imageRef, item);
  }

  const uniqueIcons = new Map();
  for (const item of iconNodes) {
    const key = slug(item.name);
    if (!uniqueIcons.has(key)) uniqueIcons.set(key, item);
  }

  return {
    imageFills: [...uniqueRefs.values()],
    icons: [...uniqueIcons.values()],
  };
}

async function downloadBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
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

  console.log("\nFigma API 2/3: GET /v1/files/:id/images");
  const imageMapRes = await axios.get(`https://api.figma.com/v1/files/${fileId}/images`, {
    headers,
  });

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

    fs.writeFileSync(outPath, await downloadBuffer(url));
    manifest.images[item.imageRef] = outPath.replace(/^\.\//, "");
    console.log(`  saved ${filename}`);
  }

  if (icons.length) {
    const ids = icons.map((icon) => icon.id).join(",");
    console.log("\nFigma API 3/3: GET /v1/images/:id (svg icons)");

    const iconRes = await axios.get(`https://api.figma.com/v1/images/${fileId}`, {
      headers,
      params: { ids, format: "svg" },
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
      fs.writeFileSync(outPath, await downloadBuffer(url));
      manifest.icons[icon.name] = outPath.replace(/^\.\//, "");
      console.log(`  saved ${filename}`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

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
