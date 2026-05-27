# CHANGELOG

## 1.3.19

- Foundry v14 compatibility: namespaced `mergeObject`, `TextEditor`, and `duplicate` calls so they resolve under both v12 (global) and v13+ (`foundry.utils` / `foundry.applications.ux.TextEditor.implementation`)
- Removed the deprecated `async: true` option from `Roll#evaluate` and `TextEditor.enrichHTML` calls
- Awaited `actor.update` calls in `_performRoll` to prevent overlapping data-preparation cycles that triggered "ActiveEffect application phase already completed" errors
- Player Overview: moved tab-switching out of an inline `<script>` in the template into the V1 `activateListeners` lifecycle. Fixes the `Cannot read properties of null (reading 'classList')` error when no players have assigned actors, and stops click handlers stacking on every re-render
- Actor creation: removed the no-op `prepareData`/`prepareBaseData`/`prepareDerivedData` overrides on `CainActor` and the no-op `prepareData` on `CainItem`. Their empty bodies skipped `super`, leaving the v13+ ActiveEffect phase tracker uninitialized and producing `Cannot set properties of undefined (setting 'initial')` on `new` actor construction
- Actor creation: consolidated per-type default image and prototype-token defaults into a single `updateSource` call inside `CainActor#_preCreate`; removed the corresponding `_preCreate` overrides from `CainCharacter` and `CainNPC` data models. Multiple `updateSource` calls during `_preCreate` retriggered the data-prep cycle in v13+ and caused cascading "ActiveEffect application phase already completed" errors
- Domain item: `CainDomain#_preCreate` no longer unconditionally overwrites the source `img` with the ogre default. It now only sets the default when no image was explicitly provided. Previously, importing the Domains compendium caused every domain to display the ogre icon regardless of its source image
- Scene-control tooltips: in v14 the core scene-control handler silently drops clicks while `canvas.ready` is `false` (no active scene). The Divine Agony / Hunt Tracker / Dice Roller tool titles now append " — activate a scene to enable" when there's no scene, so hovering explains the non-response instead of looking broken
- Dice Roller scene-control: switched the v13/v14 branch from the deprecated `onClick` to `onChange` (the `onClick` deprecation warning is scheduled to remove the option in v15); the v12 branch keeps `onClick`
- CAT placeholder parser: the `{<CAT> type modifier}` regex required a modifier, so power text like Ardence's Sabre's `{<CAT> distance_normal}` (no modifier) fell through and the literal placeholder was shown. The modifier capture is now optional and defaults to `0`, matching the apparent author intent — Sabre now renders the CAT value the same way Fury does
- Psyche Burst dialog: added "Blast" to the Common Psyche Uses dropdown
- Multi-actor sheet sync bug: skill / psyche-burst / xp / advancement checkbox `id` attributes in the character sheet templates were not unique across sheets. When a single player had two character sheets open at once, the browser's `<label for="...">` lookup matched the first element in the document, so clicking a checkbox label on sheet 2 fired the change event on sheet 1's checkbox and wrote the update to actor 1. All four affected `id`/`for` pairs are now suffixed with `{{@root.actor.id}}` to make them unique per sheet. (Used `@root` rather than a relative path because the `range` and `each` helpers swap the Handlebars context, which would make a relative `{{actor.id}}` resolve to undefined.) This also explains the previously reported "Psyche Burst toggle sometimes does nothing or resets to full" symptom when multiple sheets were open

## 1.2.0

- Add support for Foundry v10