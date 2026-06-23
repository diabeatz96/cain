/**
 * Extract the Blasphemy QUIRKS from Games for Freaks, volume 4 (CAIN content)
 * into the blasphemy2 pack source.
 *
 * Quirks are optional, alternate/additive passives (plus a few replacement
 * active powers) for existing blasphemies. They map onto the existing
 * `blasphemyPower` item type. They are emitted as STANDALONE powers (never
 * added to any blasphemy's `system.powers` array) so they do not auto-apply —
 * a player drags in the single quirk they chose. Each inherits its parent
 * blasphemy's colours + icon, and is tagged with the "Quirk" keyword.
 *
 * They live under a dedicated "Quirks" folder (one subfolder per blasphemy)
 * so they are easy to find and never confused with the default powers.
 *
 * Idempotent: re-running deletes the previously-generated GFF4 docs and
 * regenerates them with the same stable ids.
 *
 * Run with:  node ./tools/extract-gff4-quirks.mjs
 * Then rebuild:  npm run build:packs   (with the Foundry world closed)
 */
import { promises as fs } from "fs";
import path from "path";

const PACK_DIR = "src/packs/blasphemy2";
const SYSTEM_VERSION = "1.3.26";
const ROOT_FOLDER_ID = "GFF4QuirksRoot01";

// Parent blasphemy colours + icons (pulled from the blasphemy2 pack).
const BLASPHEMY = {
  Tension: { img: "tension.png", p: "#595959", a: "#ff0000", s: "#000000", t: "#ffffff" },
  Flux:    { img: "flux.png",    p: "#808080", a: "#ff0000", s: "#4a4a4a", t: "#000000" },
  Ardence: { img: "ardence.png", p: "#333333", a: "#ff0000", s: "#000000", t: "#ffffff" },
  Tongue:  { img: "tongue.png",  p: "#000000", a: "#ff0000", s: "#4a4a4a", t: "#ffffff" },
  Vector:  { img: "vector.png",  p: "#333333", a: "#000000", s: "#878787", t: "#ffdc00" },
  Gate:    { img: "gate.png",    p: "#2a2a2a", a: "#ffe100", s: "#555555", t: "#ffffff" },
  Smother: { img: "smother.png", p: "#000000", a: "#8f8f8f", s: "#000000", t: "#ffe100" },
  Track:   { img: "track.png",   p: "#2a2a2a", a: "#ffdc00", s: "#000000", t: "#ffffff" },
  Whisper: { img: "whisper.png", p: "#2a2a2a", a: "#0064ff", s: "#555555", t: "#ffffff" },
  Edit:    { img: "edot.png",    p: "#2a2a2a", a: "#0064ff", s: "#555555", t: "#ffffff" },
  Bind:    { img: "bind.png",    p: "#2a2a2a", a: "#0064ff", s: "#555555", t: "#ffffff" },
  Wire:    { img: "wire.png",    p: "#2a2a2a", a: "#0064ff", s: "#000000", t: "#ffffff" },
  Palace:  { img: "palace.png",  p: "#2a2a2a", a: "#ff00ff", s: "#555555", t: "#ffffff" },
  Jaunt:   { img: "jaunt.png",   p: "#2a2a2a", a: "#ff00ff", s: "#555555", t: "#ffffff" },
  Sympathy:{ img: "sympathy.png",p: "#2a2a2a", a: "#ff00ff", s: "#555555", t: "#ffffff" },
  // blasphemyType for Mother is stored uppercase ("MOTHER") in the pack.
  MOTHER:  { img: "mother.png",  p: "#2a2a2a", a: "#ff00ff", s: "#555555", t: "#ffffff" }
};

const ASSET = "systems/cain/assets/Blasphemies";

// note: "replaces X" / "adds to X" / "complements X" — rendered as a trailing line.
const QUIRKS = [
  // ---- TENSION (instead of Iron Soul: Steel, Silver, or Lead Soul) ----
  { bl: "Tension", name: "Steel Soul", passive: true, replaces: "Iron Soul",
    desc: `You specialize in projecting tension fields over bladed weapons. You gain the Severance power for free (even past the cap of 5 powers). You always use it at +1 CAT. However, you can only use it while wielding a bladed weapon in one or both hands.

Additionally, you can project a psychic cutting force at short range by rolling PSYCHE. This doesn't cost a psyche burst but doesn't have enough force to significantly harm someone — enough to sever a strap, cord, or cause minor cuts.` },
  { bl: "Tension", name: "Silver Soul", passive: true, replaces: "Iron Soul",
    desc: `Your body is infused with psychic fields that are stronger when you follow your convictions, and weaker when you don't.

When you end a conflict scene, you automatically erase 1 stress if you followed any agenda item in that scene. If you didn't follow any, gain 2 nonlethal stress instead.` },
  { bl: "Tension", name: "Lead Soul", passive: true, replaces: "Iron Soul",
    desc: `Your body is suffused with tension fields that make you extremely dense, heavy, and tough. Your weight is tripled and only forces 2 categories higher than your current category can move you against your will. Your unarmed strikes count as service weapons (and can be upgraded). In addition, you can only take a maximum of 1 stress from falling or impacts from vehicles or objects, no matter the category.

In return, actions that require you to move quickly are hard for you by default.` },

  // ---- FLUX (instead of Steal Time: Clockstopper or Timesplitter) ----
  { bl: "Flux", name: "Clockstopper", passive: true, replaces: "Steal Time",
    desc: `You can use the Stop power without spending any psyche bursts, lasting a full minute, and it does not cause temporal instability. Using the power this way 'steals time' from your future lifespan and supernaturally ages you.

Draw an actual clock on your sheet, starting at 12:00 noon, then advance time by 1d3 hours. Also advance the clock by 1 hour if you suffer sin overflow, or you may advance it any time you would gain temporal instability (1 hour for 1 temporal instability). This clock cannot be affected in any other way.

Each hour from 12–5pm ages you 1d3 years. Each hour from 6–9 ages you around 1d6+2 years, and each hour from 10–12 ages you around 2d6+8. This has no effect on your abilities. At midnight, you die of old age (this cannot be ignored).` },
  { bl: "Flux", name: "Timesplitter", passive: true, replaces: "Steal Time",
    desc: `Once a hunt, without spending a psyche burst, you may cause a temporal fracture when undertaking any course of action. This fracture ends when an action roll is made, when you would die or suffer sin overflow, or after exactly 777 seconds have expired in the fiction.

This activity takes place in an alternate timeline, in which everything is otherwise exactly the same. When the fracture expires, you revert to the main timeline, undoing all outcomes, resources spent, harm taken, or consequences, but keeping any knowledge or memory from the alternate timeline. You or an ally may take +1D on the next roll that takes advantage of this information. Then play forward as normal.` },

  // ---- ARDENCE (instead of Inner Furnace: Void Furnace, which also swaps Fury->Blackmatter, Sabre->Nihil) ----
  { bl: "Ardence", name: "Void Furnace", passive: true, replaces: "Inner Furnace",
    desc: `Your powers focus on the cold at the end of the universe, the fathomless emptiness of entropy. This changes the following:

• Pallor: You are always cold to the touch and can't be warmed up. You can't suffer negative effects or harm due to cold weather or temperature (even extreme cold), but you still feel it. You subtract 1 from all your resting rolls if the area where you are resting isn't warm.
• Void Affinity: No power you take can ever produce heat.
• Rise from Abyss: Your powers from this blasphemy increase in potency the closer you are to death. They gain +1 CAT in all capabilities if you have an injury, a further +1 CAT if you have two or more, and a further +1 CAT if another exorcist has died this mission.
• Collapse: If you die, your body snap freezes and begins collapsing into a nonspace. Touching it without protection can inflict incredible harm from the cold (around 3–4 stress). It will require special removal by CAIN, therefore it cannot be recovered by your compatriots.

Void Furnace also replaces some of your powers: replace Fury with Blackmatter, and Sabre with Nihil.` },
  { bl: "Ardence", name: "Blackmatter", passive: false, keywords: ["Instant", "Long"], burstCost: true, replaces: "Fury (with Void Furnace)",
    desc: `Instant, Long.

You instantly disperse heat in an area, creating a killing flash freeze at a location in range with a blast area up to ½ CAT. This inflicts harm on anything living in the area and instantly freezes liquids and environments, causing damage. Roll PSYCHE for its effects, and only spend a psyche burst on success.

When you use this power, you may inflict 1 nonlethal but irreducible stress on yourself to gain +1D on the roll as your body partly freezes over. If you do, increase the nonlethal stress suffered the next time you use this power by +1. This effect stacks but resets when you rest.` },
  { bl: "Ardence", name: "Nihil", passive: false, keywords: ["Instant", "Melee"], burstCost: true, replaces: "Sabre (with Void Furnace)",
    desc: `Instant, Melee.

By placing your palms outwards, you release a terrifying annihilative force at hand's reach, affecting a base ½ CAT area immediately adjacent to you. Roll PSYCHE for its effects, and only spend a psyche burst on success. This force is tremendous but slow, giving it the following:

• It gains +2D when rolling to blast through immobile targets (living or nonliving), walls, constructions, or inanimate objects.
• Unless you are set up by another exorcist, using this power when a roll is risky is always hard.` },

  // ---- TONGUE (instead of The Word: Taboo) ----
  { bl: "Tongue", name: "Taboo", passive: true, replaces: "The Word",
    desc: `Certain words are banned for you. When you, the character or the player, speak those words (even inadvertently) in any voice louder than a whisper, resolve any powers triggered by your speech, then it inflicts a supernatural destructive shockwave on everything other than you in a CAT+1 area centered on you (roll PSYCHE for effects, including harm, etc), and temporarily deafens everyone in that area. Your voice is blown out and your character is unable to speak or use powers from any blasphemy until you rest.

Banned words: Sin, Cain, the name of any blasphemies or blasphemy powers (including your own), and the name of a sin type (ogre, lord, etc).` },

  // ---- VECTOR (instead of Brake: Axis or Rail) ----
  { bl: "Vector", name: "Axis", passive: true, replaces: "Brake",
    desc: `Your powers rely on rotational velocity.

Inscribe Axis: The Fling and Current powers from this blasphemy move things either clockwise or counter-clockwise around you or a point you choose in hand's reach, instead of in a straight line. The range of these abilities instead becomes the radius of this circular path.

Holy Chakra: You may roll 1d6 when an object or projectile equal or lower than your CAT would impact you. If you roll a 4+, it instead orbits harmlessly around you and away from you, missing you and inflicting a max of 1 stress. If successful, lose the use of this passive until you rest.` },
  { bl: "Vector", name: "Rail", passive: true, replaces: "Brake",
    desc: `When moving, you automatically increase your own velocity. All your own movement (not movement granted to others) is +1 CAT higher, including movement without your powers. You can 'skate' on a small bubble of vectorized air underneath your feet, allowing you to move across water or slippery surfaces.

However, none of your powers work if you are unable to move while using them.` },

  // ---- GATE (instead of Pocket: Stroll or Rummage) ----
  { bl: "Gate", name: "Stroll", passive: true, replaces: "Pocket",
    desc: `Once a scene, without spending a psyche burst, you can attempt to teleport yourself to a point in short distance you can see (even just partly) with enough space for you to arrive by rolling 1d6. On a 3+, you are successful. On a 1–2, you teleport anyway to a point in range, but the Admin tells you where you end up.` },
  { bl: "Gate", name: "Rummage", passive: true, replaces: "Pocket",
    desc: `Once a scene, you can spend 1 kp to pull a random item out of a space that an item could be stored (clothing, suit pocket, in a desk drawer, etc). This only works if you are not looking while you're pulling the item out. The item that comes out may not necessarily logically fit the space, but comes out anyway. Roll 1d6, then the Admin picks something from the rolled list.

1. Fountain pen, Live Grenade, Leather gloves, Lighter (small, plain), Pack of cigarettes (2 missing), Phone charger
2. Roll of coins, Crowbar, Stapler, Claw hammer, Camcorder (1 hr tape), Chapstick
3. Handgun (unloaded), two cigarettes, Faded photograph, Instruction manual for building furniture (in Swedish), Map of the area (folded, well used, in Swedish), Large pack of caramel candies
4. Cell phone (10% battery), Thick sheathe of printer paper, Large amount of cash, Full bottle of wine, Fire Axe, Huge box of nails
5. Chewing Gum, Lipstick, Coffee Mug (novelty), Folded Letter, Hat (situation appropriate), Clip of 9mm ammo for a handgun
6. Useful key, Pocket Knife, Lighter (oversized, novelty), Bicycle (foldable), Dictionary for translating Swedish, six sided die` },

  // ---- SMOTHER (instead of Absentia: Digit or Ban) ----
  { bl: "Smother", name: "Digit", passive: true, replaces: "Absentia",
    desc: `You can instantly (and cleanly) lose a finger to gain +1D and +1 CAT to any power when you use it. It disappears as if it had been cut off a long time ago. Roll 1d6 (2–3: left hand, 4–5: right hand).

If you run out of fingers on one hand, you automatically lose fingers on the other. If you roll a 1, you lose another finger and roll again (this can keep going!). If you roll a 6, you can choose which hand you lose a finger on.

Gain -1D on any rolls that would require using the affected hand until the next hunt, when you have time to adjust to the disability. If you have no fingers left, you lose your head instead and suffer (gruesome) instant death, which cannot be ignored.` },
  { bl: "Smother", name: "Ban", passive: true, replaces: "Absentia",
    desc: `Gain the Abstract power from this Blasphemy for free (even past the limit of 5 powers). You can now use it once a hunt to affect a single human or exorcist, leaving them an unrecognizable blur and preventing them from taking action. They recover if taking harm or if the scene passes.

Roll PSYCHE for effects and only spend a psyche burst on success. Take or grant +1D on the next action taking advantage of this as normal.` },

  // ---- TRACK (adds to passive: Catch Vibe) ----
  { bl: "Track", name: "Catch Vibe", passive: true, adds: "your Track passive",
    desc: `Your starting playlist is smaller (4 tracks). However, you can add or swap in and out any (real life) music track played during the session by you, your GM, or any of the players into your active playlist for the remainder of the hunt, or any music track played diagetically (in the game). This could push it up to 10 tracks.` },

  // ---- WHISPER (adds to passive: The Future Rules!) ----
  { bl: "Whisper", name: "The Future Rules!", passive: true, adds: "your Whisper passive",
    desc: `You cannot die, except from causes which aren't ignorable. If you would die, you miraculously survive in an improbable way, pass out, and come to consciousness at the start of the next scene with 1 remaining injury and half your stress full.

However, roll 1d6 at the end of each mission you complete. On a 1, foreboding doom sets in, and you become certain that the next mission is the one you die on. Increase the range of this number by +1 for each mission it doesn't trigger (so the next time would be on a roll of 1–2).

While you are affected by foreboding doom, you lose your ability to ignore death and suffer instant death instead any time you suffer an injury. You can defy this fate as normal.` },

  // ---- EDIT (instead of Mimic: Scenery or Alter) ----
  { bl: "Edit", name: "Scenery", passive: true, replaces: "Mimic",
    desc: `Once a scene, when using any power from this blasphemy, if you can pull from a work of art nearby, it does not cost a psyche burst. The same work of art does not work twice in the same hunt, and the quality of the end result is dependent on the quality of the artwork.` },
  { bl: "Edit", name: "Alter", passive: true, replaces: "Mimic",
    desc: `When you rest or go to sleep, you disappear and are replaced by a different version of yourself with similar memories. These versions of yourself rotate in from another reality where this power activated. Your appearance changes as if you used the Mimic passive. Choose one:

• You are holding something small but useful (a tool, a weapon, a key, a map)
• You have faint memories of a piece of information pertinent to the current investigation. Ask the GM a yes or no question about the current hunt and get a truthful answer.
• You are slightly less stressed (-1 stress) than your current version.` },

  // ---- BIND (free complements: Sin Strike, Sin Evolve, Menagerie; replaces Sin Binding: Wretched Host; capstone: the King) ----
  { bl: "Bind", name: "Sin Strike", passive: false, keywords: ["Instant", "Short"], burstCost: true, complements: "Bind",
    desc: `Instant, Short.

You can command an active sin to attack by spending a psyche burst as long as both your sin and its target are in range, and you can communicate with it. Roll PSYCHE for its effects. The attack has supernatural potency.` },
  { bl: "Bind", name: "Sin Evolve", passive: true, complements: "Bind",
    desc: `Your bound sins increase in ability as you gain category.

• CAT 2+: Your sins gain the ability to speak and develop a humanlike intelligence. Only psychically sensitive people can hear them.
• CAT 3+: Your sins can take on a humanlike form, or take on a larger animal-like form, or switch between these forms. Both forms are still only visible to exorcists and other sins, and are purely aesthetic.
• CAT 4+: Your bound sins can appear visible and audible to humans. Graceless humans typically find this traumatic (roll PSYCHE for any effects).
• CAT 5+: You can have two active sins out at once. Any action you take with them must apply to one or the other. Failing to absorb stress for an action taken by a sin banishes both of them.` },
  { bl: "Bind", name: "Menagerie", passive: true, complements: "Bind",
    desc: `When you defeat a sin during a hunt, you may bind it as a new bound sin during a rest. This applies even for minor sins or foes with the type 'sin', such as Traces. Doing so typically requires approval from the Temerity Office of Stability (which can sometimes be waived). A captive sin is mechanically identical to your original bound sin but may differ in aesthetics and personality. You can swap your active bound sin in and out, including your original bound sin, and keep up to six. Inactive sins retract into a dormant state inside your sin seed.` },
  { bl: "Bind", name: "Wretched Host", passive: true, replaces: "Sin Binding",
    desc: `You don't have a bound sin. Instead, you are a former type II sin host, where the sin is fused to your flesh and is part of you.

You gain the Surrender blasphemy power for free, it loses the charm tag, and its effects can stack up to three times on you. Instead of costing a psyche burst, it always costs 1 sin to activate.

All powers that would apply to your sin instead apply to you, and physically transform you.` },
  { bl: "Bind", name: "Summon the Ten Thousand Sword King", passive: false, keywords: ["Ultimate"], complements: "Bind",
    desc: `If you have the Bind blasphemy and are either CAT 5 or on the brink of death, you can beckon the infinite blue. The skies that were denied to us come rushing forth, and do not stop. The stars are falling, each of them a perfect blade.

Summoning the King immediately initiates an apocalyptic force in an area around the size of a town (around CAT 5), centered on you. The infinite sword field appears, turning the sky a perfect blue.

Sins and exorcists in the area, including you, roll 1d6 and add their category. If the result is 9 or higher, they survive the unending assault, otherwise they are obliterated. Exorcists suffer instant death, sins are reduced to blood-soaked ashes. This fate can be defied as normal. Perfect Sins (Games for Freaks, volume 3) always survive.

Anything else that survives takes 5 slashes on its execution talisman. All other humans, creatures, and structures in the area around CAT 5 or under are annihilated with unbelievable force unless protected by supernatural and similarly overwhelming force. Afterwards, the King departs.

You can describe, if you wish, the way that your character accepts or avoids their fate. If you are particularly avaricious of victory, you may attempt to fight, or even bind the King, though such matters are best left up to your table to figure out. Few beings exist that are stronger than it, and perhaps there are none at all. Its grief is infinite, after all.

Summoning the King can only be done once in a game of CAIN.` },

  // ---- WIRE (instead of Main Artery: Worm) ----
  { bl: "Wire", name: "Worm", passive: true, replaces: "Main Artery",
    desc: `You can produce light reading material (novels, magazines, etc) at will, without costing KP, though it dissolves after a few minutes of losing contact with your body.

In addition, all wire powers apply to books instead of computers or phones and can be used with books. When you'd produce a computer terminal with Terminal or Deck, you instead produce an appropriate book (almanac, history book, encyclopedia, comic book, etc), including from people's bodies. Surge works with books (you must have read, or at least be familiar with, the destination book), and Disk turns your target into a book. Call creates a duplicate journal on both you and your target if the target picks up. Writing in the journal causes the writing to supernaturally and instantly appear on the duplicate, regardless of distance.` },

  // ---- PALACE (instead of Sanctum: Recluse or Manifold) ----
  { bl: "Palace", name: "Recluse", passive: true, replaces: "Sanctum",
    desc: `Only you can enter your palace (with the exception of the Bar power, and psychic doubles, such as from Parlor). It grants no resting benefits, but otherwise functions as the normal Sanctum power. In addition, you can enter it any time you like by concentrating for a few moments.

When you enter your palace, you physically disappear and are replaced by a palace port, which is a small reflective object. Historically, these have been things like gemstones, mirrors, or basins of water, but in modern times have sometimes become things like phone screens, laptops, or portable video game consoles. Outside observers, including mundane humans, can see and talk to you inside your palace, though your voice and appearance may seem distant or distorted. While inside your palace, you can use powers from this blasphemy normally to affect the outside world.

You remain in the palace until you voluntarily leave. If the object is damaged, you are shunted out, take stress as if you were targeted by that damage, and you cannot re-enter until you rest. The port can be supernaturally repaired during a rest at no cost.` },
  { bl: "Palace", name: "Manifold", passive: true, replaces: "Sanctum",
    desc: `Your palace functions as the normal Sanctum power, except:

Once a hunt, when you open any door or cross any threshold, you can instead open a door to a single room of your choice in your palace, physically manifesting it. Doing so does not require spending a PSYCHE burst. Opening any door out of this room opens and connects to a random door nearby, determined by the GM. The space inside your palace could be larger than is physically possible from the outside.

When you use any palace power, including its passive, you must physically manifest the corresponding part of your palace as part of that power, as prior, though you can do this any number of times. If you don't have a door on hand to do this with, you can't activate the power, though any door will qualify (car doors, microwave or fridge doors, etc).

Other beings can enter your manifested palace rooms, even those hostile to you. The rooms stop existing when you are no longer physically inside, or are outside and let go of the door handle, and push out anyone or anything from the outside reality when they collapse back into their original form.` },

  // ---- JAUNT (instead of Ghostwire: Corpus, Hollow, or Silver Sight) ----
  { bl: "Jaunt", name: "Corpus", passive: true, replaces: "Ghostwire",
    desc: `You specialize in the bodies of the recently deceased. Once a scene, when you touch a corpse, you can tell exactly how long ago it died, and get brief visions of its death, granting you +1D when next you act on the answers in the same scene.

Additionally, you can use the Possession power on corpses without spending a psyche burst, and you can use the Desecrate power on living, but unconscious, humans.` },
  { bl: "Jaunt", name: "Hollow", passive: true, replaces: "Ghostwire",
    desc: `You specialize in the incorporeal remnants of psyche.

You can use the Geist blasphemy power without spending a psyche burst, once between rests.

If you have only one passenger from the Passenger power, they can now use psychic powers using your body, and you can use powers normally. When they use a power, you take any effects or consequences as if you used the power, though they spend any resources (sin, bursts, etc). These powers immediately end if your passenger exits.` },
  { bl: "Jaunt", name: "Silver Sight", passive: true, replaces: "Ghostwire",
    desc: `You are completely blind, but permanently benefit from the Threads power from this blasphemy and gain it for free. It can overlap with other powers. Since you are used to seeing this way, actions against living things are not hard for you, but other actions that require sight are. If you participate in teamwork or gain setup, you can ignore this restriction in addition to the normal benefits of teamwork or setup.

In addition, your extreme sensitivity to grace lets you immediately sense (with some imprecision) if anyone in a ½ CAT area centered on you has any psychic sensitivity, and how much, or if there are any supernatural beings in a similar area, how close they are, and how strong they are.` },

  // ---- SYMPATHY (instead of Resonance: Locus) ----
  { bl: "Sympathy", name: "Locus", passive: true, replaces: "Resonance",
    desc: `You specialize in a particular object, but have an aversion to others. Choose an object on the list of resonances. You are automatically resonant with that object, but find activities that involve any of the other objects on that list hard by default. Actions are also hard when you are touching, wearing, or in hand's reach of those objects. You can swap this focus around at the start of each hunt, or when you rest.` },

  // ---- MOTHER (instead of Mother's Embrace: Mother's Love) ----
  { bl: "MOTHER", name: "Mother's Love", passive: true, replaces: "Mother's Embrace",
    desc: `Your strain of mother is less detectable, and you look more human.

Twice a hunt, you may listen to the whispers of Mother (ask the GM what She is saying) when using a blasphemy power from this blasphemy. If you follow her advice or direction, you may use that power without spending a psyche burst, it gains +1D on any PSYCHE rolls, +1 CAT, and all sin costs from that power are reduced to 1 for its duration.

However, using the power becomes risky if it wasn't already, and the risk die becomes a '1' automatically.` }
];

const sanitize = (s) => (s || "unnamed").replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);

function stats() {
  return {
    compendiumSource: null, duplicateSource: null,
    coreVersion: "12.343", systemId: "cain", systemVersion: SYSTEM_VERSION,
    createdTime: 0, modifiedTime: 0, lastModifiedBy: null
  };
}

function folderDoc(id, name, parentId, sort) {
  return {
    name, type: "Item", folder: parentId, sorting: "a",
    _id: id, description: "", sort, color: null, flags: {},
    _stats: stats(), _key: `!folders!${id}`
  };
}

async function main() {
  // 1. Clear out any previously-generated GFF4 quirk docs (idempotent).
  const existing = (await fs.readdir(PACK_DIR)).filter(f => f.endsWith(".json"));
  for (const f of existing) {
    const full = path.join(PACK_DIR, f);
    const doc = JSON.parse(await fs.readFile(full, "utf8"));
    if (doc._id?.startsWith("GFF4Q")) await fs.unlink(full);
  }

  // 2. Build folders: a "Quirks" root + one subfolder per blasphemy that has quirks.
  const blasphemiesInOrder = [...new Set(QUIRKS.map(q => q.bl))];
  const folderIdFor = {};
  const folders = [folderDoc(ROOT_FOLDER_ID, "Quirks", null, 0)];
  blasphemiesInOrder.forEach((bl, i) => {
    const id = `GFF4QFolder${String(i + 1).padStart(5, "0")}`;
    folderIdFor[bl] = id;
    const label = bl === "MOTHER" ? "Mother" : bl;
    folders.push(folderDoc(id, label, ROOT_FOLDER_ID, (i + 1) * 1000));
  });

  // 3. Build the quirk power docs.
  let n = 0;
  const docs = [];
  for (const q of QUIRKS) {
    const meta = BLASPHEMY[q.bl];
    if (!meta) throw new Error(`Unknown blasphemy: ${q.bl}`);
    const id = `GFF4Quirk${String(++n).padStart(7, "0")}`;
    const keywords = ["Quirk", ...(q.passive ? ["Passive"] : []), ...(q.keywords || [])];

    // trailing relationship note
    let note = "";
    if (q.replaces) note = `\n\nQuirk — replaces ${q.replaces}.`;
    else if (q.adds) note = `\n\nQuirk — adds to ${q.adds} (does not replace it).`;
    else if (q.complements) note = `\n\nQuirk — complements ${q.complements} (free).`;

    docs.push({
      name: q.name, sorting: "a", folder: folderIdFor[q.bl], type: "blasphemyPower",
      _id: id, img: `${ASSET}/${meta.img}`, sort: n * 100, flags: {},
      system: {
        blasphemyType: q.bl,
        powerName: q.name,
        isPassive: !!q.passive,
        keywords,
        powerDescription: q.desc + note,
        description: "",
        primaryColor: meta.p, accentColor: meta.a, secondaryColor: meta.s, textColor: meta.t,
        psycheBurstCost: !!q.burstCost,
        psycheBurstNoCost: !!q.burstNoCost,
        psycheBurstMultCost: false
      },
      _stats: stats(),
      _key: `!items!${id}`
    });
  }

  // 4. Write everything.
  for (const f of folders) {
    await fs.writeFile(path.join(PACK_DIR, `${sanitize(f.name)}_${f._id}.json`), JSON.stringify(f, null, 2));
  }
  for (const d of docs) {
    await fs.writeFile(path.join(PACK_DIR, `${sanitize(d.name)}_${d._id}.json`), JSON.stringify(d, null, 2));
  }

  console.log(`Wrote ${docs.length} quirk powers across ${blasphemiesInOrder.length} blasphemies.`);
  console.log(`Folders: Quirks > [${blasphemiesInOrder.map(b => b === "MOTHER" ? "Mother" : b).join(", ")}]`);
  console.log(`Now run: npm run build:packs (with the Foundry world closed)`);
}

main();
