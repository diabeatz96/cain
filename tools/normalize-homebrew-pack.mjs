/**
 * Normalize the homebrew pack source (src/packs/homebrew):
 *   1. Organizes every item into a folder structure — a root folder with one
 *      subfolder per item type — so the compendium (and anything imported from
 *      it via importAll) is structured instead of one flat list.
 *   2. Assigns themed default icons, mirroring the official convention where a
 *      child item shares its parent's icon (a blasphemy's powers use the
 *      blasphemy's icon; an agenda's tasks/abilities use the agenda's icon).
 *
 * Idempotent: re-running regenerates the folder docs and reassigns icons
 * deterministically (parents are sorted by name, so the mapping is stable).
 *
 * Run with:  node ./tools/normalize-homebrew-pack.mjs
 * Then rebuild the pack:  npm run build:packs
 */
import { promises as fs } from "fs";
import path from "path";

const PACK_DIR = "src/packs/homebrew";
const ASSET = "systems/cain/assets";
const SYSTEM_VERSION = "1.3.25";

// Root folder all homebrew content is nested under (identifies it once imported).
const ROOT = { id: "HBWaveRoot000001", name: "Second Wave" };

// One subfolder per item type. Stable 16-char ids (separate keyspace from items).
const TYPE_FOLDERS = {
    blasphemy:      { id: "HBWaveBlasphemy1", name: "Blasphemies",      sort: 100000 },
    blasphemyPower: { id: "HBWaveBlasPower1", name: "Blasphemy Powers", sort: 200000 },
    agenda:         { id: "HBWaveAgenda0001", name: "Agendas",          sort: 300000 },
    agendaTask:     { id: "HBWaveAgTask0001", name: "Agenda Tasks",     sort: 400000 },
    agendaAbility:  { id: "HBWaveAgAbil0001", name: "Agenda Abilities", sort: 500000 },
    item:           { id: "HBWaveItems00001", name: "Items",            sort: 600000 }
};

const BLASPHEMY_ICONS = [
    "ardence", "bind", "edot", "flux", "gate", "jaunt", "kindagraceless", "mother",
    "palace", "sidewire", "smother", "sympathy", "tension", "tongue", "track",
    "vector", "whisper", "wire"
].map(n => `${ASSET}/Blasphemies/${n}.png`);

const AGENDA_ICONS = [
    "beast", "demon", "departed", "doomed", "firebug", "guardian", "hardline",
    "loner", "machine", "moth", "shadow", "songbird", "sorcerer", "survivor",
    "temperance", "torch"
].map(n => `${ASSET}/Agendas/${n}.png`);

const ITEM_ICON = `${ASSET}/items/kp.png`;

const sanitize = (s) => (s || "unnamed").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);

function folderDoc(id, name, parentId, sort) {
    return {
        name, type: "Item", folder: parentId, sorting: "m",
        _id: id, description: "", sort, color: null, flags: {},
        _stats: {
            compendiumSource: null, duplicateSource: null,
            coreVersion: "12.343", systemId: "cain", systemVersion: SYSTEM_VERSION,
            createdTime: 0, modifiedTime: 0, lastModifiedBy: null
        },
        _key: `!folders!${id}`
    };
}

async function main() {
    const allFiles = (await fs.readdir(PACK_DIR)).filter(f => f.endsWith(".json"));

    // Load everything; separate item docs from existing folder docs.
    const items = [];
    const oldFolderFiles = [];
    for (const f of allFiles) {
        const full = path.join(PACK_DIR, f);
        const doc = JSON.parse(await fs.readFile(full, "utf8"));
        if (doc._key?.startsWith("!folders!") || doc.type === "Folder") {
            oldFolderFiles.push(full);
        } else {
            items.push({ file: full, doc });
        }
    }

    // Remove stale folder docs so re-runs don't accumulate them.
    for (const f of oldFolderFiles) await fs.unlink(f);

    const get = (type) => items.filter(i => i.doc.type === type).map(i => i.doc);

    // Parents: deterministic icon per parent (sorted by name).
    const blasphemies = get("blasphemy").sort((a, b) => a.name.localeCompare(b.name));
    blasphemies.forEach((b, i) => { b.img = BLASPHEMY_ICONS[i % BLASPHEMY_ICONS.length]; });

    const agendas = get("agenda").sort((a, b) => a.name.localeCompare(b.name));
    agendas.forEach((a, i) => { a.img = AGENDA_ICONS[i % AGENDA_ICONS.length]; });

    // Map each child id to its parent's icon (linked icons).
    const childIcon = new Map();
    for (const b of blasphemies) {
        for (const pid of (b.system.powers || [])) childIcon.set(pid, b.img);
    }
    for (const a of agendas) {
        for (const cid of [...(a.system.unboldedTasks || []), ...(a.system.boldedTasks || []), ...(a.system.abilities || [])]) {
            childIcon.set(cid, a.img);
        }
    }

    // Assign icons + folder to every item and write it back.
    let iconCount = 0;
    for (const { file, doc } of items) {
        switch (doc.type) {
            case "item": doc.img = ITEM_ICON; break;
            case "blasphemyPower": doc.img = childIcon.get(doc._id) ?? BLASPHEMY_ICONS[0]; break;
            case "agendaTask":
            case "agendaAbility": doc.img = childIcon.get(doc._id) ?? AGENDA_ICONS[0]; break;
            // blasphemy / agenda already assigned above
        }
        const folder = TYPE_FOLDERS[doc.type];
        if (folder) doc.folder = folder.id;
        iconCount++;
        await fs.writeFile(file, JSON.stringify(doc, null, 2));
    }

    // Write the root folder + per-type subfolders.
    const folders = [folderDoc(ROOT.id, ROOT.name, null, 0)];
    for (const f of Object.values(TYPE_FOLDERS)) {
        folders.push(folderDoc(f.id, f.name, ROOT.id, f.sort));
    }
    for (const f of folders) {
        const name = `${sanitize(f.name)}_${f._id}.json`;
        await fs.writeFile(path.join(PACK_DIR, name), JSON.stringify(f, null, 2));
    }

    console.log(`Normalized ${iconCount} items.`);
    console.log(`Wrote ${folders.length} folders: ${ROOT.name} > [${Object.values(TYPE_FOLDERS).map(f => f.name).join(", ")}]`);
    console.log(`Now run: npm run build:packs`);
}

main();
