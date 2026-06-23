/**
 * Extract the AESTHETICS gear from Games for Freaks, volume 4 (CAIN content)
 * into the existing `items` pack source.
 *
 * These are cosmetic items purchasable with Scrip. They map onto the existing
 * `item` type and drop into the pack's existing "Aesthetics" folder
 * (id GdN0nfCDP965wxF0), matching the established `system.type: "Aesthetics"`
 * convention used by the stock wardrobe items.
 *
 * Idempotent: re-running deletes prior GFF4Aes docs and regenerates them.
 *
 * Run with:  node ./tools/extract-gff4-aesthetics.mjs
 * Then rebuild:  npm run build:packs   (with the Foundry world closed)
 */
import { promises as fs } from "fs";
import path from "path";

const PACK_DIR = "src/packs/items";
const SYSTEM_VERSION = "1.3.26";
const AESTHETICS_FOLDER = "GdN0nfCDP965wxF0"; // existing "Aesthetics" folder
const ICON = "systems/cain/assets/items/kp.png";

// scrip = Scrip cost (S); cat = CAT requirement text or null; tag = extra note or null.
const ITEMS = [
  { name: "Designated Comfort Animal", scrip: 1, cat: null, tag: null,
    desc: "Comfort item for base use only." },
  { name: "Book Tote", scrip: 1, cat: null, tag: null,
    desc: "Reinforced canvas. Registered students may borrow for free." },
  { name: "Control Collar", scrip: 3, cat: null, tag: "Conspicuous",
    desc: "Suppresses powers when worn, limiting to max CAT 1. Takes a rest to remove safely." },
  { name: "Summer Longcoat", scrip: 2, cat: "CAT 3+", tag: null,
    desc: "Lighter, breathable material. Designed with ease of movement in mind." },
  { name: "Varsity Jacket", scrip: 3, cat: "CAT 3+", tag: null,
    desc: "Logo selection approved for campus sports and recreation activities." },
  { name: '"Downpour" Overcoat', scrip: 4, cat: "CAT 4+", tag: null,
    desc: "Heavier, cold-weather version of the classic 'Well' (model has an attached anti-psychic ops patch, not included)." },
  { name: '"Armagen" Headphones', scrip: 2, cat: "CAT 2+", tag: null,
    desc: "Excellent quality headphones, usually for staff use during lab testing. Music player provided separately." },
  { name: "Operations Coat", scrip: 1, cat: "CAT 2+", tag: null,
    desc: "Simple, mass-produced coat usually disbursed for active anti-sin combat missions." },
  { name: "Kiren Custom Footwear", scrip: 5, cat: "CAT 2+", tag: null,
    desc: "Improved and fitted footwear from the 'Heated Wave' base atelier. Shipping time around 2–3 wks." },
  { name: '"Blackwell" Leather Overcoat', scrip: 4, cat: "CAT 4+", tag: null,
    desc: "Modified by owner, a variant of the basic 'Well'. Worn by the advanced discipline committee." },
  { name: '"Banneret" Longcoat', scrip: 4, cat: "CAT 4+", tag: null,
    desc: "Tailored to fit. Typical uniform for those allowed to audit Board meetings, or employed as security for higher-clearance Authority facilities." }
];

const sanitize = (s) => (s || "unnamed").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);

async function main() {
  // Clear prior GFF4 aesthetic docs.
  for (const f of (await fs.readdir(PACK_DIR)).filter(f => f.endsWith(".json"))) {
    const full = path.join(PACK_DIR, f);
    const doc = JSON.parse(await fs.readFile(full, "utf8"));
    if (doc._id?.startsWith("GFF4Aes")) await fs.unlink(full);
  }

  let n = 0;
  for (const it of ITEMS) {
    const id = `GFF4Aes${String(++n).padStart(9, "0")}`;
    const req = [it.cat, it.tag].filter(Boolean).join(", ");
    const description =
      `<p>${it.desc}</p>` +
      (req ? `<p><strong>${req}</strong></p>` : "");

    const doc = {
      folder: AESTHETICS_FOLDER,
      name: it.name,
      type: "item",
      img: ICON,
      system: {
        description,
        quantity: 1,
        weight: 0,
        roll: { diceNum: 1, diceSize: "d6", diceBonus: "" },
        kitPoint: 0,
        scripValue: it.scrip,
        type: "Aesthetics"
      },
      effects: [],
      flags: {},
      _stats: {
        compendiumSource: null, duplicateSource: null,
        coreVersion: "12.343", systemId: "cain", systemVersion: SYSTEM_VERSION,
        createdTime: 0, modifiedTime: 0, lastModifiedBy: null, exportSource: null
      },
      _id: id,
      sort: n * 100,
      ownership: { default: 0 },
      _key: `!items!${id}`
    };
    await fs.writeFile(path.join(PACK_DIR, `${sanitize(it.name)}_${id}.json`), JSON.stringify(doc, null, 2));
  }

  console.log(`Wrote ${n} aesthetic items into the items pack "Aesthetics" folder.`);
  console.log(`Now run: npm run build:packs (with the Foundry world closed)`);
}

main();
