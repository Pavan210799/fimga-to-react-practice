import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

const token = process.env.FIGMA_TOKEN;
const fileId = process.env.FIGMA_FILE_ID;
const nodeId = "2683:6274"; // from Figma URL node-id=2683-6274

async function downloadFigma() {
  const url =
    `https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`;

  const response = await axios.get(url, {
    headers: { "X-Figma-Token": token },
  });

  fs.writeFileSync("./figma-node.json", JSON.stringify(response.data, null, 2));
  console.log("Saved figma-node.json");
}

downloadFigma();