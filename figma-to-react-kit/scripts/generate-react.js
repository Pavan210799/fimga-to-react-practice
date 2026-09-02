import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

/**
 * LOCAL GENERATOR — 0 Figma API calls
 *
 * Reads:
 *   - figma-node.json           (from fetch-figma.js)
 *   - src/assets/manifest.json  (from download-figma-images.js)
 *
 * Writes React + CSS into src/generated/
 *
 *   node scripts/generate-react.js --all
 *   node scripts/generate-react.js Header
 *   node scripts/generate-react.js "Hero Section"
 *
 * Safe to re-run as many times as you want.
 */

// ---------------------------------------------------------------------------
// CHANGE PER PROJECT
// ---------------------------------------------------------------------------

/** Must match FIGMA_NODE_ID used when you ran fetch-figma.js */
const NODE_ID = process.env.FIGMA_NODE_ID;

/**
 * Top-level Figma layer names to skip (lowercase).
 * Use inspect-figma.js to see names. Example: decorative dot grids.
 */
const SKIP_SECTION_NAMES = new Set(["titik-titik"]);

/**
 * CSS font-family for generated text.
 * Copy the family from: node scripts/inspect-figma.js Header
 */
const FONT_FAMILY = '"Source Sans 3", "Source Sans Pro", sans-serif';

/** Google Fonts URL used in generated CSS. Change to match FONT_FAMILY. */
const FONT_IMPORT =
  '@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap");';

const JSON_PATH = "./figma-node.json";
const MANIFEST_PATH = "./src/assets/manifest.json";
const OUTPUT_DIR = "./src/generated";

// ---------------------------------------------------------------------------

const arg = process.argv[2] || "--all";

const SKIP_TYPES = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "STAR",
  "LINE",
  "REGULAR_POLYGON",
]);

if (!NODE_ID) {
  console.error("Set FIGMA_NODE_ID in .env");
  process.exit(1);
}

if (!fs.existsSync(JSON_PATH)) {
  console.error("figma-node.json not found. Run fetch-figma.js once first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const page = data.nodes[NODE_ID]?.document;

if (!page) {
  console.error(`Node ${NODE_ID} not found in figma-node.json`);
  process.exit(1);
}

const manifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
  : { images: {}, icons: {} };

function toPascalCase(name) {
  const parts = name.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/);
  const pascal = parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return pascal.replace(/^[0-9]/, "S$&") || "Section";
}

function toSlug(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "node"
  );
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function fillToCss(fills = []) {
  const solid = fills.find(
    (fill) => fill.type === "SOLID" && fill.visible !== false && fill.color
  );
  if (!solid) return null;

  const { r, g, b, a = 1 } = solid.color;
  const opacity = solid.opacity ?? a ?? 1;
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);

  if (opacity < 1) {
    return `rgba(${red}, ${green}, ${blue}, ${round(opacity)})`;
  }

  return `rgb(${red}, ${green}, ${blue})`;
}

function justifyContent(value) {
  if (value === "CENTER") return "center";
  if (value === "MAX") return "flex-end";
  if (value === "SPACE_BETWEEN") return "space-between";
  return "flex-start";
}

function alignItems(value) {
  if (value === "CENTER") return "center";
  if (value === "MAX") return "flex-end";
  if (value === "BASELINE") return "baseline";
  return "flex-start";
}

function imageRefOf(node) {
  const fill = (node.fills || []).find(
    (item) => item.type === "IMAGE" && item.visible !== false && item.imageRef
  );
  return fill?.imageRef || null;
}

function toImportId(filePath, used) {
  const base = path.basename(filePath, path.extname(filePath));
  let name = base.replace(/[^a-zA-Z0-9]/g, "_");
  if (!/^[A-Za-z_]/.test(name)) name = `asset_${name}`;
  let unique = name;
  let n = 2;
  while (used.has(unique)) {
    unique = `${name}_${n}`;
    n += 1;
  }
  used.add(unique);
  return unique;
}

function assetImportPath(diskPath) {
  // src/assets/icons/foo.svg → ../assets/icons/foo.svg (from src/generated)
  return diskPath.replace(/^src\//, "../");
}

function lookupIconByName(name) {
  if (!name) return null;
  if (manifest.icons[name]) return manifest.icons[name];

  const wanted = toSlug(name);
  for (const [iconName, filePath] of Object.entries(manifest.icons)) {
    if (toSlug(iconName) === wanted) return filePath;
  }

  return null;
}

function findIconPath(node) {
  const own = lookupIconByName(node.name);
  if (own) return own;

  for (const child of node.children || []) {
    const nested = findIconPath(child);
    if (nested) return nested;
  }

  return null;
}

function isIconTree(node) {
  if (node.type === "TEXT") return false;
  if (imageRefOf(node)) return false;
  if (SKIP_TYPES.has(node.type)) return true;

  const children = node.children || [];
  if (children.length === 0) {
    return ["COMPONENT", "INSTANCE", "GROUP"].includes(node.type);
  }

  return children.every(isIconTree);
}

function looksLikeButton(node) {
  if (imageRefOf(node)) return false;
  return Boolean(node.cornerRadius && fillToCss(node.fills));
}

function generateSection(section) {
  const componentName = toPascalCase(section.name);
  const cssPrefix = toSlug(section.name);
  const cssRules = [];
  const imports = [];
  const usedImportIds = new Set();
  let classCounter = 0;

  function registerAsset(diskPath) {
    const existing = imports.find((item) => item.diskPath === diskPath);
    if (existing) return existing.id;
    const id = toImportId(diskPath, usedImportIds);
    imports.push({ id, diskPath, importPath: assetImportPath(diskPath) });
    return id;
  }

  function nextClass(node) {
    classCounter += 1;
    return `${cssPrefix}-${toSlug(node.name)}-${classCounter}`;
  }

  function buildCss(className, node, { absolute = false, parentBox = null, media = false } = {}) {
    const rules = ["  box-sizing: border-box;"];
    const box = node.absoluteBoundingBox;

    if (!media && (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL")) {
      rules.push("  display: flex;");
      rules.push(
        `  flex-direction: ${node.layoutMode === "VERTICAL" ? "column" : "row"};`
      );
      rules.push(`  justify-content: ${justifyContent(node.primaryAxisAlignItems)};`);
      rules.push(`  align-items: ${alignItems(node.counterAxisAlignItems)};`);

      if (node.itemSpacing) rules.push(`  gap: ${node.itemSpacing}px;`);
      if (node.paddingTop) rules.push(`  padding-top: ${node.paddingTop}px;`);
      if (node.paddingRight) rules.push(`  padding-right: ${node.paddingRight}px;`);
      if (node.paddingBottom) rules.push(`  padding-bottom: ${node.paddingBottom}px;`);
      if (node.paddingLeft) rules.push(`  padding-left: ${node.paddingLeft}px;`);
    }

    if (absolute && parentBox && box) {
      rules.push("  position: absolute;");
      rules.push(`  left: ${round(box.x - parentBox.x)}px;`);
      rules.push(`  top: ${round(box.y - parentBox.y)}px;`);
    }

    if (box) {
      rules.push(`  width: ${round(box.width)}px;`);
      rules.push(`  height: ${round(box.height)}px;`);
    }

    if (media) {
      rules.push("  display: block;");
      rules.push("  object-fit: cover;");
      rules.push("  flex-shrink: 0;");
      if (node.type === "ELLIPSE") {
        rules.push("  border-radius: 50%;");
      } else if (node.cornerRadius) {
        rules.push(`  border-radius: ${node.cornerRadius}px;`);
      }
    } else {
      const background = fillToCss(node.fills);
      if (background && node.type !== "TEXT" && !imageRefOf(node)) {
        rules.push(`  background: ${background};`);
      }
      if (node.cornerRadius) {
        rules.push(`  border-radius: ${node.cornerRadius}px;`);
      }
    }

    if (node.type === "TEXT" && node.style) {
      const color = fillToCss(node.fills) || "#122118";
      rules.push("  margin: 0;");
      rules.push(`  font-family: ${FONT_FAMILY};`);
      rules.push(`  font-size: ${node.style.fontSize}px;`);
      rules.push(`  font-weight: ${node.style.fontWeight};`);
      if (node.style.lineHeightPx) {
        rules.push(`  line-height: ${round(node.style.lineHeightPx)}px;`);
      }
      rules.push(`  color: ${color};`);
      rules.push("  white-space: nowrap;");
    }

    if (looksLikeButton(node)) {
      rules.push("  border: none;");
      rules.push("  cursor: pointer;");
    }

    cssRules.push(`.${className} {\n${rules.join("\n")}\n}`);
  }

  function generateNode(node, parent, { absolute = false } = {}) {
    if (!node || node.visible === false) return "";
    if (SKIP_TYPES.has(node.type)) return "";

    const photoRef = imageRefOf(node);
    const photoPath = photoRef ? manifest.images[photoRef] : null;

    if (photoPath) {
      const className = nextClass(node);
      const importId = registerAsset(photoPath);
      buildCss(className, node, {
        absolute,
        parentBox: parent?.absoluteBoundingBox,
        media: true,
      });
      return `<img className="${className}" src={${importId}} alt="" />`;
    }

    if (isIconTree(node)) {
      const iconPath = findIconPath(node);
      const className = nextClass(node);
      buildCss(className, node, {
        absolute,
        parentBox: parent?.absoluteBoundingBox,
        media: Boolean(iconPath),
      });

      if (iconPath) {
        const importId = registerAsset(iconPath);
        return `<img className="${className}" src={${importId}} alt="" />`;
      }

      return `<span className="${className}" aria-hidden="true" />`;
    }

    if (node.type === "TEXT") {
      const className = nextClass(node);
      buildCss(className, node, {
        absolute,
        parentBox: parent?.absoluteBoundingBox,
      });
      const text = JSON.stringify(node.characters || "");
      return `<span className="${className}">{${text}}</span>`;
    }

    const className = nextClass(node);
    const hasLayout =
      node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL";

    buildCss(className, node, {
      absolute,
      parentBox: parent?.absoluteBoundingBox,
    });

    if (!hasLayout) {
      cssRules[cssRules.length - 1] = cssRules[cssRules.length - 1].replace(
        `{`,
        `{\n  position: relative;`
      );
    }

    const childAbsolute = !hasLayout;
    const children = (node.children || [])
      .map((child) => generateNode(child, node, { absolute: childAbsolute }))
      .filter(Boolean)
      .map((jsx) => `  ${jsx}`)
      .join("\n");

    const Tag = looksLikeButton(node)
      ? "button"
      : node.name.toLowerCase() === "header"
        ? "header"
        : "div";
    const typeAttr = Tag === "button" ? ' type="button"' : "";

    if (!children) {
      return `<${Tag} className="${className}"${typeAttr} />`;
    }

    return `<${Tag} className="${className}"${typeAttr}>
${children}
</${Tag}>`;
  }

  const rootJsx = generateNode(section, page, { absolute: false });

  const importLines = [
    `import "./${componentName}.css";`,
    ...imports.map((item) => `import ${item.id} from "${item.importPath}";`),
  ].join("\n");

  const jsx = `${importLines}

function ${componentName}() {
  return (
    ${rootJsx.split("\n").join("\n    ")}
  );
}

export default ${componentName};
`;

  const css = `/* Generated from figma-node.json + src/assets — no Figma API request */
${FONT_IMPORT}

.${cssPrefix} {
  box-sizing: border-box;
}

${cssRules.join("\n\n")}
`;

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.jsx`), jsx, "utf8");
  fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.css`), css, "utf8");

  console.log(`  ${componentName}.jsx  (${imports.length} assets)`);
}

function resolveSection(name) {
  if (page.name.toLowerCase() === name.toLowerCase()) return page;
  return page.children?.find(
    (child) => child.name.toLowerCase() === name.toLowerCase()
  );
}

const targets =
  arg === "--all"
    ? (page.children || []).filter(
        (child) => !SKIP_SECTION_NAMES.has(child.name.toLowerCase())
      )
    : (() => {
        const section = resolveSection(arg);
        if (!section) {
          console.error(`Section "${arg}" not found.`);
          console.error("Available:");
          page.children?.forEach((child) => console.error(`  - ${child.name}`));
          process.exit(1);
        }
        return [section];
      })();

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("FIGMA JSON + ASSETS → REACT");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("No Figma API request was made.");
console.log("");

for (const section of targets) {
  generateSection(section);
}

console.log("");
console.log(`Output: ${OUTPUT_DIR}`);
console.log("");
