import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const PACK_SRC = "./packs";
const PACK_DEST = "./src/packs";

async function unpackAll() {
  const packs = await fs.readdir(PACK_SRC);

  for (const pack of packs) {
    const packPath = path.join(PACK_SRC, pack);
    const stat = await fs.stat(packPath);

    // Skip files, only process directories (LevelDB packs are folders)
    if (!stat.isDirectory()) continue;
    if (pack.startsWith(".") || pack === "_source") continue;

    const destPath = path.join(PACK_DEST, pack);
    console.log(`Unpacking ${pack}...`);

    try {
      await extractPack(packPath, destPath, {
        yaml: false,
        clean: true,
        log: true,
        transformName: (doc) => {
          const safeName = (doc.name || "unnamed")
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .substring(0, 40);
          return `${safeName}_${doc._id}.json`;
        }
      });
    } catch (err) {
      console.error(`Failed to unpack ${pack}:`, err.message);
    }
  }

  console.log("\nDone! JSON files are in ./src/packs/");
  console.log("You can now add packs/ to .gitignore and commit src/packs/ instead.");
}

unpackAll();
