import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const PACK_SRC = "./src/packs";
const PACK_DEST = "./packs";

async function packAll() {
  // Ensure destination exists
  await fs.mkdir(PACK_DEST, { recursive: true });

  const packs = await fs.readdir(PACK_SRC);

  for (const pack of packs) {
    const srcPath = path.join(PACK_SRC, pack);
    const stat = await fs.stat(srcPath);

    if (!stat.isDirectory()) continue;
    if (pack.startsWith(".")) continue;

    const destPath = path.join(PACK_DEST, pack);
    console.log(`Packing ${pack}...`);

    try {
      await compilePack(srcPath, destPath, {
        yaml: false,
        log: true,
        recursive: true
      });
    } catch (err) {
      console.error(`Failed to pack ${pack}:`, err.message);
    }
  }

  console.log("\nDone! LevelDB packs are in ./packs/");
}

packAll();
