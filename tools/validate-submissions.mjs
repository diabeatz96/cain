/**
 * Validates homebrew submissions dropped into the /submissions folder.
 *
 * Accepts either:
 *   - a homebrew export bundle:  { "items": [ {name, type, system}, ... ] }
 *   - a single item file:        { name, type, system }
 *
 * Run locally with:  node ./tools/validate-submissions.mjs
 * The GitHub Action runs this on every PR that touches submissions/**.
 *
 * Exits 1 (failure) if any submitted JSON file is malformed or has items
 * with an unknown type / missing required fields. ZIP files are accepted
 * but not inspected here (a maintainer extracts and converts them).
 */
import { promises as fs } from "fs";
import path from "path";

const SUBMISSIONS_DIR = "./submissions";

// Item types the CAIN system understands (parents + linked children).
const VALID_TYPES = new Set([
  "agenda", "agendaTask", "agendaAbility",
  "blasphemy", "blasphemyPower",
  "bond", "bondAbility",
  "affliction", "item",
  "sinMark", "sinMarkAbility",
  "domain"
]);

const errors = [];
const warnings = [];
let fileCount = 0;
let itemCount = 0;
let zipCount = 0;

/** Recursively collect all files under a directory. */
async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/** Validate a single item-shaped object. `where` is a human-readable location. */
function validateItem(item, where) {
  if (typeof item !== "object" || item === null || Array.isArray(item)) {
    errors.push(`${where}: expected an item object.`);
    return;
  }
  if (!item.name || typeof item.name !== "string") {
    errors.push(`${where}: missing a string "name".`);
  }
  if (!item.type || typeof item.type !== "string") {
    errors.push(`${where}: missing a string "type".`);
  } else if (!VALID_TYPES.has(item.type)) {
    errors.push(`${where}: unknown item type "${item.type}". Valid types: ${[...VALID_TYPES].join(", ")}.`);
  }
  if (typeof item.system !== "object" || item.system === null) {
    errors.push(`${where} ("${item.name ?? "?"}"): missing a "system" object.`);
  }
  itemCount++;
}

async function validateJsonFile(file) {
  fileCount++;
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (err) {
    errors.push(`${file}: could not read file (${err.message}).`);
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    errors.push(`${file}: invalid JSON — ${err.message}`);
    return;
  }

  // Export bundle shape: { items: [...] }
  if (data && Array.isArray(data.items)) {
    if (data.items.length === 0) {
      warnings.push(`${file}: export bundle contains 0 items.`);
    }
    data.items.forEach((item, i) => validateItem(item, `${file} → items[${i}]`));
    return;
  }

  // Single item shape: { name, type, system }
  if (data && (data.type || data.name)) {
    validateItem(data, file);
    return;
  }

  errors.push(`${file}: unrecognized shape. Expected an export bundle ({ "items": [...] }) or a single item ({ name, type, system }).`);
}

async function main() {
  const files = await walk(SUBMISSIONS_DIR);

  const jsonFiles = files.filter(f => f.toLowerCase().endsWith(".json") && !path.basename(f).startsWith("_"));
  zipCount = files.filter(f => f.toLowerCase().endsWith(".zip")).length;

  for (const file of jsonFiles) {
    await validateJsonFile(file);
  }

  // ---- Report ----
  const lines = [];
  lines.push(`## Homebrew Submission Validation`);
  lines.push("");
  lines.push(`- JSON files checked: **${fileCount}**`);
  lines.push(`- Items validated: **${itemCount}**`);
  if (zipCount > 0) {
    lines.push(`- ZIP files found: **${zipCount}** (accepted, not auto-validated — a maintainer will extract these)`);
  }
  lines.push("");

  if (warnings.length) {
    lines.push(`### ⚠️ Warnings`);
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  if (errors.length) {
    lines.push(`### ❌ Errors (${errors.length})`);
    for (const e of errors) lines.push(`- ${e}`);
    lines.push("");
    lines.push(`Please fix the issues above and update your pull request.`);
  } else if (fileCount === 0 && zipCount === 0) {
    lines.push(`No submission files found. Add your homebrew JSON (or ZIP) under \`submissions/\`.`);
  } else {
    lines.push(`### ✅ All submitted files look valid!`);
  }

  const report = lines.join("\n");
  console.log(report);

  // Write to the GitHub Step Summary if running in Actions.
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, report + "\n");
    } catch { /* non-fatal */ }
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
