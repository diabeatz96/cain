/**
 * Extract the RECREATION downtime activities from Games for Freaks, volume 4
 * (CAIN content) into a new `recreation` pack source.
 *
 * MVP: each of the 5 activities (Kitchen, Gym, Lab, Surface, Lounge) becomes a
 * browsable `item` doc whose description holds the facility text plus the
 * reflection questions, iconned with the existing assets/Recreation art.
 *
 * The intro/overview rules become a 6th "Recreation (Overview)" entry so the
 * how-to-play caveats ship alongside the activities.
 *
 * Idempotent: re-running regenerates the whole pack source.
 *
 * Run with:  node ./tools/extract-gff4-recreation.mjs
 * Then rebuild:  npm run build:packs   (with the Foundry world closed)
 * NOTE: also register the pack in system.json (type "Item", path "packs/recreation").
 */
import { promises as fs } from "fs";
import path from "path";

const PACK_DIR = "src/packs/recreation";
const SYSTEM_VERSION = "1.3.26";
const ART = "systems/cain/assets/Recreation";

const OVERVIEW = {
  name: "Recreation (Overview)",
  img: `${ART}/lounge.png`,
  access: "Once between hunts",
  body: `Once between hunts, the entire group may optionally choose one of the following recreation activities and take the associated keycard, answering the attached questions and exploring the answers. This provides a little downtime to the exorcists and allows them to develop their characters and relationships outside of the stresses and confines of a hunt.`,
  sections: [
    ["Caveats", [
      "The group must agree on the same activity, and it costs nothing.",
      "Exorcists may choose to split from the group and choose a different activity. If they do, they must pay 1 scrip, even if someone has already bought access to their chosen activity.",
      "If an activity specifies morning or evening access only, one time period must be chosen. This mainly changes the setting of the scenes."
    ]],
    ["Conduct", [
      "Exorcists must be well behaved during recreation. Every area has security cameras and keycard access doors that limit who can come and go.",
      "Letting in unapproved personnel, tampering with surveillance, damaging facilities, leaving them untidy, or taking items out is punishable by sanction and bans activities for the offender for the next period between hunts.",
      "Repeat or severe offenders are docked scrip (usually 1 or 2) or disciplined."
    ]]
  ],
  questions: []
};

const ACTIVITIES = [
  {
    name: "Kitchen Access",
    img: `${ART}/kitchen.png`,
    access: "All-day access",
    body: `All-day access to private dormitory kitchen facilities, with a large stock of non-perishable or frozen ingredients. The kitchen is sterile and too brightly lit, but well stocked. There is an attached, well-furnished dining area which is windowless and underlit. On formal occasions (holidays, founding day, or any of the thirteen days of mourning and remembrance), formalwear is required for dinner and is provided. May pay 1 scrip to stock better cooking ingredients such as fresh vegetables or fruits.`,
    questions: [
      "Who cooks, one or many? How's the labor split up? Who eats or doesn't eat?",
      "What's your relationship to food?",
      "How did the food turn out? What did you end up cooking?",
      "Go around the table — each character can: share a conversation they had over food; share something other characters noticed about them (or didn't!) during the meal; or choose not to share."
    ]
  },
  {
    name: "Gym Access",
    img: `${ART}/gym.png`,
    access: "All-day access",
    body: `All-day access to the CASTLE facility recreation center. Facilities are dated but well lit, stocked, and maintained. Gymwear and swimwear that conform to CASTLE dress codes are provided and required. Amenities: a swimming pool (cold, sterile, well lit); a cavernous ball court for basketball, indoor tennis, squash, indoor soccer, hockey and the like (equipment must be arranged beforehand, setup is up to the exorcists, competitive games encouraged); and a gym with training mats, weights, and equipment for martial arts, wrestling, tumbling, strength training, or general fitness.`,
    questions: [
      "How do you spend your time? Do you try to spend it alone or with others?",
      "What is your relationship to sports and fitness?",
      "Do you believe in self-improvement?",
      "How competitive are you? Do you play for fun or for keeps?"
    ],
    note: `If you play a sport or competitive game, use associated skill rolls (conditioning, coordination, force, etc) with roll-offs to determine outcomes. Rolls can be set up, assisted, etc as usual. It's standard among exorcists to set a powers / no-powers rule before playing.`
  },
  {
    name: "Lab Access",
    img: `${ART}/lab.png`,
    access: "All-day access",
    body: `All-day access to spare Temerity facilities. The Training Room (aka the Block) is a barren, cavernous industrial room whose walls, doors, floors and even the observation glass are reinforced with grids of Y-alloy — a rare, psychically resistant metal infused with the fibrous flesh of the Ymir tree. It is nigh impervious to forces and blasphemy powers of CAT 3 and lower, and takes only minor damage from forces 4 and higher; training dioramas are usually set up inside. The Observation Deck can monitor produced forces, grace, and veil fluctuation, and holds a two-layer kill switch that seals all doors and sounds the alarm. The Research Alcove fits one or two people, with a small library and a PC with (slow at peak, otherwise fast 56k) CAIN intranet access.`,
    questions: [
      "Do you spend your time in practice or observation?",
      "Do you embrace or reject your powers?",
      "Do you believe you are a weapon?",
      "What's a quirk, oddity, or feature of your powers you show us or notice?"
    ],
    note: `If you have characters show off their powers, they don't gain sin (unless they want to) and don't have to spend a psyche burst.`
  },
  {
    name: "Surface Access",
    img: `${ART}/surface.png`,
    access: "Morning or evening access",
    body: `Morning or evening access to the surface of the current CAIN facility. Around two-thirds of active CAIN facilities are buried at least a mile underground; the rest, including main headquarters, sit in the middle of the ocean. Going up is tightly monitored and security is extremely high — perimeter security is kill-on-sight, though signage and fencing are clear. Surroundings are typically remote or inhospitable: high mountain forest, deep red desert, arctic ice, or endless ocean. Acclimatization sunglasses are provided for exorcists who've spent more than a week underground. Surface facilities usually include faculty offices, VTOL pads, docks, rail and cranes, sunlight-dependent Temerity lab infrastructure, gardens and a vegetable patch, and a running track. Most are inaccessible without good relationships or special dispensation; for low-category exorcists, surface access is usually just a chance to see the sun, breathe unfiltered air, and get a walk in.`,
    questions: [
      "How do you spend your time on the surface?",
      "Do you have any special permissions up here?",
      "What does it feel like to see the sun again?",
      "Do you love, hate, or notice something interesting or surprising in the natural environment around the base on this particular visit?"
    ]
  },
  {
    name: "Lounge Access",
    img: `${ART}/lounge.png`,
    access: "Morning or evening access",
    body: `Morning or evening access to a private facility lounge — highly in demand. Lounges typically have (and only have!) the following amenities: one television and cassette player with a mostly-donated collection of movies and recorded TV out of date by several months (no live TV); a small bookshelf of well-used books, outdated periodicals, comics and board games; large worn furniture and two blankets; climate control that does not work; a fridge and small kitchen, mostly barren, with a stained coffee maker, gas range, tin kettle, tea, and ration-grade snacks; one CD or cassette player with a mostly-donated but carefully curated music collection and two pairs of attachable headphones; and a Centura Vamigo game console with around 10 cartridges and two controllers (a few buttons on the second controller tend to jam).`,
    questions: [
      "How do you spend your time?",
      "How do you manage to share what's available?",
      "What surprising or interesting things do you find, play, read, or discover buried in the shelves and cabinets? (You may find something that's not listed!)"
    ]
  }
];

function descriptionHtml(a) {
  let html = `<p><em>${a.access}.</em></p><p>${a.body}</p>`;
  for (const [heading, lines] of (a.sections || [])) {
    html += `<h3>${heading}</h3><ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
  }
  if (a.questions && a.questions.length) {
    html += `<h3>Questions</h3><p>Go around the table and ask:</p><ul>${a.questions.map(q => `<li>${q}</li>`).join("")}</ul>`;
    html += `<p>You may choose to play some scenes out based on the answers, and continue to play out scenes as needed.</p>`;
  }
  if (a.note) html += `<p><em>${a.note}</em></p>`;
  return html;
}

const sanitize = (s) => (s || "unnamed").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);

async function main() {
  await fs.mkdir(PACK_DIR, { recursive: true });
  // Wipe the pack source so re-runs are clean.
  for (const f of (await fs.readdir(PACK_DIR)).filter(f => f.endsWith(".json"))) {
    await fs.unlink(path.join(PACK_DIR, f));
  }

  const all = [OVERVIEW, ...ACTIVITIES];
  let n = 0;
  for (const a of all) {
    const id = `GFF4Rec${String(++n).padStart(9, "0")}`;
    const doc = {
      folder: null,
      name: a.name,
      type: "item",
      img: a.img,
      system: {
        description: descriptionHtml(a),
        quantity: 1,
        weight: 0,
        roll: { diceNum: 1, diceSize: "d6", diceBonus: "" },
        kitPoint: 0,
        scripValue: 0,
        type: "Recreation"
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
    await fs.writeFile(path.join(PACK_DIR, `${sanitize(a.name)}_${id}.json`), JSON.stringify(doc, null, 2));
  }

  console.log(`Wrote ${n} recreation entries into ${PACK_DIR}.`);
  console.log(`Remember: register the pack in system.json (type "Item", path "packs/recreation").`);
  console.log(`Now run: npm run build:packs (with the Foundry world closed)`);
}

main();
