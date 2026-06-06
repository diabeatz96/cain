# Homebrew Submissions

Drop your homebrew content here to propose it for inclusion in the CAIN system's
default compendiums. A maintainer reviews each submission, converts it into the
system's compendium packs, and credits you in the release.

## How to submit

1. **Create your content in Foundry** using the **Homebrew Laboratory** window
   (the flask icon), or build it normally in your world's Items directory.
2. **Export it:** open the Homebrew Laboratory → **Import/Export** tab →
   **Export Folders as ZIP**. Tick the folder(s) holding your content and
   download the ZIP. (Linked powers/abilities are bundled automatically.)
   - The ZIP is laid out like the system's own pack sources — every item is a
     `src/packs/homebrew/<Name>_<id>.json` file, so a maintainer can drop it
     straight into the repo and run `npm run build:packs`. It compiles into the
     dedicated **Homebrew** compendium.
   - A single-file JSON export (**Export All Content**) works too.
3. **Open a pull request** that adds your file(s) to this `submissions/` folder.
   Put each contributor's content in its own subfolder, e.g.
   `submissions/your-name/my-blasphemies.zip`.
4. A GitHub Action automatically checks that any `.json` you include is valid.
   Fix anything it flags, then a maintainer takes it from there.

## What you can submit

- A **ZIP** from the "Export Folders as ZIP" button (recommended).
- An **export bundle** JSON: `{ "items": [ { "name", "type", "system" }, ... ] }`.
- One or more **single item** JSON files: `{ "name", "type", "system", ... }`.

Supported item types: `agenda`, `blasphemy` (+ `blasphemyPower`), `bond`
(+ `bondAbility`), `affliction`, `item`, `sinMark`, `domain`, and their linked
children (`agendaTask`, `agendaAbility`, `sinMarkAbility`).

## Notes

- ZIP files are accepted but not auto-validated — the maintainer extracts them.
- Please include a short note in your PR describing the content and how you'd
  like to be credited.
- By submitting, you agree your content can be distributed as part of this
  system under its license.
