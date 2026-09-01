import fs from "fs";
import path from "path";

/**
 * Reads figma-node.json only. Does not call the Figma API.
 *
 * Usage:
 *   node scripts/generate-react.js Header
 *   node scripts/generate-react.js "Hero Section"
 */

const NODE_ID = "2683:6274";
const JSON_PATH = "./figma-node.json";
const OUTPUT_DIR = "./src/generated";
const sectionName = process.argv[2] || "Header";

const SKIP_TYPES = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "STAR",
  "LINE",
  "REGULAR_POLYGON",
]);

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const page = data.nodes[NODE_ID]?.document;

if (!page) {
  console.error("Node not found in figma-node.json");
  process.exit(1);
}

const section = page.children?.find(
  (child) => child.name.toLowerCase() === sectionName.toLowerCase()
);

if (!section) {
  console.error(`Section "${sectionName}" not found.`);
  console.error("Available:");
  page.children?.forEach((child) => console.error(`  - ${child.name}`));
  process.exit(1);
}

const componentName = toPascalCase(section.name);
const cssPrefix = toSlug(section.name);
const cssRules = [];
let classCounter = 0;

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
  const solid = fills.find((fill) => fill.type === "SOLID" && fill.visible !== false && fill.color);
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

function isIconTree(node) {
  if (node.type === "TEXT") return false;
  if (SKIP_TYPES.has(node.type)) return true;

  const children = node.children || [];
  if (children.length === 0) {
    return ["COMPONENT", "INSTANCE", "GROUP"].includes(node.type);
  }

  return children.every(isIconTree);
}

function nextClass(node) {
  classCounter += 1;
  return `${cssPrefix}-${toSlug(node.name)}-${classCounter}`;
}

function iconLabel(node) {
  const name = node.name.toLowerCase();
  if (name.includes("arrow-down")) return "⌄";
  if (name.includes("document-upload") || name.includes("upload")) return "↑";
  return "";
}

function firstFill(node) {
  const own = fillToCss(node.fills);
  if (own) return own;
  for (const child of node.children || []) {
    const nested = firstFill(child);
    if (nested) return nested;
  }
  return null;
}

function buildCss(className, node, { absolute = false, parentBox = null, icon = false } = {}) {
  const rules = ["  box-sizing: border-box;"];
  const box = node.absoluteBoundingBox;

  if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") {
    rules.push("  display: flex;");
    rules.push(
      `  flex-direction: ${node.layoutMode === "VERTICAL" ? "column" : "row"};`
    );
    rules.push(`  justify-content: ${justifyContent(node.primaryAxisAlignItems)};`);
    rules.push(`  align-items: ${alignItems(node.counterAxisAlignItems)};`);

    if (node.itemSpacing) {
      rules.push(`  gap: ${node.itemSpacing}px;`);
    }

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

  const background = fillToCss(node.fills);
  if (background && node.type !== "TEXT") {
    rules.push(`  background: ${background};`);
  }

  if (node.cornerRadius) {
    rules.push(`  border-radius: ${node.cornerRadius}px;`);
  }

  if (node.type === "TEXT" && node.style) {
    const color = fillToCss(node.fills) || "#122118";
    rules.push(`  margin: 0;`);
    rules.push(`  font-family: "Source Sans 3", "Source Sans Pro", sans-serif;`);
    rules.push(`  font-size: ${node.style.fontSize}px;`);
    rules.push(`  font-weight: ${node.style.fontWeight};`);
    if (node.style.lineHeightPx) {
      rules.push(`  line-height: ${round(node.style.lineHeightPx)}px;`);
    }
    rules.push(`  color: ${color};`);
    rules.push("  white-space: nowrap;");
  }

  if (icon) {
    const iconFill = firstFill(node);
    if (iconFill && !background) {
      rules.push(`  background: ${iconFill};`);
    }
    rules.push("  flex-shrink: 0;");
    rules.push("  display: inline-flex;");
    rules.push("  align-items: center;");
    rules.push("  justify-content: center;");
    rules.push("  pointer-events: none;");
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

  if (isIconTree(node)) {
    const className = nextClass(node);
    buildCss(className, node, {
      absolute,
      parentBox: parent?.absoluteBoundingBox,
      icon: true,
    });
    const label = iconLabel(node);
    return `<span className="${className}" aria-hidden="true">${label}</span>`;
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

function looksLikeButton(node) {
  return Boolean(node.cornerRadius && fillToCss(node.fills));
}

const rootJsx = generateNode(section, page, { absolute: false });

const jsx = `import "./${componentName}.css";

function ${componentName}() {
  return (
    ${rootJsx.split("\n").join("\n    ")}
  );
}

export default ${componentName};
`;

const css = `/* Generated from figma-node.json — no Figma API request */
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap");

.${cssPrefix} {
  box-sizing: border-box;
}

${cssRules.join("\n\n")}
`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.jsx`), jsx, "utf8");
fs.writeFileSync(path.join(OUTPUT_DIR, `${componentName}.css`), css, "utf8");

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("FIGMA JSON → REACT (local only)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Section: ${section.name}`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log(`  ├─ ${componentName}.jsx`);
console.log(`  └─ ${componentName}.css`);
console.log("");
console.log("No Figma API request was made.");
console.log("Existing figma-node.json was used only.");
console.log("");
