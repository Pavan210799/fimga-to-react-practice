import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

/**
 * API CALL 1 of 3
 * GET /v1/files/:fileId/nodes?ids=:nodeId
 *
 * Saves the design tree to figma-node.json.
 * Run ONCE per Figma frame. Do not re-run unless the design changed.
 *
 * CHANGE PER PROJECT (in .env, not here):
 *   FIGMA_TOKEN
 *   FIGMA_FILE_ID
 *   FIGMA_NODE_ID   ← URL node-id=12-345 becomes 12:345
 */

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;
const nodeId = process.env.FIGMA_NODE_ID;

if (!token || !fileId || !nodeId) {
  console.error("Set FIGMA_TOKEN, FIGMA_FILE_ID, and FIGMA_NODE_ID in .env");
  process.exit(1);
}

async function downloadFigma() {
  const url = `https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`;

  const response = await axios.get(url, {
    headers: { "X-Figma-Token": token },
  });

  fs.writeFileSync("./figma-node.json", JSON.stringify(response.data, null, 2));
  console.log("Saved figma-node.json");
  console.log("Do not run fetch-figma.js again unless the Figma file changed.");
}

downloadFigma().catch((error) => {
  console.error(
    "API Error:",
    error.response?.status,
    error.response?.data || error.message
  );
  process.exit(1);
});
