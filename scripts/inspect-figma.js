import fs from "fs";

const NODE_ID = "2683:6274";
const sectionName = process.argv[2]; // optional: node scripts/inspect-figma.js Header

const data = JSON.parse(fs.readFileSync("./figma-node.json", "utf8"));
const page = data.nodes[NODE_ID].document;

if (!page) {
  console.error("Node not found in figma-node.json");
  process.exit(1);
}

const pageBox = page.absoluteBoundingBox;

function toHex(fills = []) {
  const solid = fills.find((fill) => fill.type === "SOLID" && fill.color);
  if (!solid) return null;
  const { r, g, b, a = 1 } = solid.color;
  const hex = [r, g, b]
    .map((value) => Math.round(value * 255).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()} / opacity ${a}`;
}

function printNode(node, level, rootX, rootY) {
  const indent = "  ".repeat(level);
  const box = node.absoluteBoundingBox;
  let position = "";

  if (box) {
    position = `Position: ${Math.round(box.x - rootX)}px, ${Math.round(box.y - rootY)}px | Size: ${Math.round(box.width)}x${Math.round(box.height)}`;
  }

  console.log(`${indent}${node.name} | ${node.type} | ${position}`);

  if (node.type === "TEXT" && node.style) {
    console.log(`${indent}  Text: "${node.characters || ""}"`);
    console.log(
      `${indent}  Font: ${node.style.fontFamily} ${node.style.fontSize}px / ${node.style.fontWeight}`
    );
  }

  const fill = toHex(node.fills);
  if (fill) {
    console.log(`${indent}  Fill: ${fill}`);
  }

  if (node.cornerRadius !== undefined) {
    console.log(`${indent}  Radius: ${node.cornerRadius}px`);
  }

  node.children?.forEach((child) => {
    printNode(child, level + 1, rootX, rootY);
  });
}

console.log("========================================");
console.log("JOB FINDER LANDING PAGE");
console.log("========================================");
console.log("Name:", page.name);
console.log("Type:", page.type);
console.log("Size:", Math.round(pageBox.width), "x", Math.round(pageBox.height));
console.log("");
console.log("Top-level sections:");
console.log("");

page.children?.forEach((child) => {
  const box = child.absoluteBoundingBox;
  console.log(
    `- ${child.name} | ${child.id} | ${child.type} | ${box ? Math.round(box.width) + "x" + Math.round(box.height) : "no-box"}`
  );
});

if (!sectionName) {
  console.log("");
  console.log('Next: node scripts/inspect-figma.js Header');
  console.log("This script only reads figma-node.json. No API call.");
  process.exit(0);
}

const section = page.children?.find(
  (child) => child.name.toLowerCase() === sectionName.toLowerCase()
);

if (!section) {
  console.error(`\nSection "${sectionName}" not found.`);
  process.exit(1);
}

const rootX = section.absoluteBoundingBox.x;
const rootY = section.absoluteBoundingBox.y;

console.log("");
console.log("========================================");
console.log(`SECTION: ${section.name}`);
console.log("========================================");
console.log("");

printNode(section, 0, rootX, rootY);

console.log("");
console.log("No Figma API request was made.");
