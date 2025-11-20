<p align="center">
  <img src="https://i.imgur.com/OX0qub4.jpeg" width="1080" alt="project-logo">
</p>
<p align="center">
    <h1 align="center">CAIN</h1>
</p>
<p align="center">
    <em>A foundry alternative playing system for CAIN, created by Tom Bloom. Code created by Adam Kostandy</em>
</p>
<p align="center">
   <img src="https://img.shields.io/github/license/diabeatz96/cain?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
   <img src="https://img.shields.io/github/last-commit/diabeatz96/cain?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
   <img src="https://img.shields.io/github/languages/top/diabeatz96/cain?style=default&color=0080ff" alt="repo-top-language">
   <img src="https://img.shields.io/github/languages/count/diabeatz96/cain?style=default&color=0080ff" alt="repo-language-count">
   <img alt="Static Badge" src="https://img.shields.io/badge/foundry-v11%20|%20v12%20|%20v13-blue">
<p>
<p align="center">
    <strong>Main Repository:</strong> <a href="https://github.com/diabeatz96/cain">https://github.com/diabeatz96/cain</a><br>
    <strong>Development Repository:</strong> <a href="https://github.com/bugeso/cain1.3">https://github.com/bugeso/cain1.3</a>
</p>
<p align="center">
   <!-- default option, no dependency badges. -->
</p>

<br><!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary><br>

- [ Overview](#-overview)
- [ Investigations](#-investigations)
- [ Features](#-features)
- [ Repository Structure](#-repository-structure)
- [ Modules](#-modules)
- [ Getting Started](#-getting-started)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Tests](#-tests)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)
</details>
<hr>

## CREDITS
    - Tom Bloom Creator of Cain
    - Adam Kostandy (Diabeatz96) - Original creator and lead developer of the repository
    - Myco from the Pilot.NET/CAIN Discord for providing icon assets
    - My sunday DND group
    - My friend carmen for miscellaneous ideas and polish
    - ahandleman and Benji as developers
    - bugeso and loupgarou for development contributions and v1.3 updates

## v1.3.X Update for CAIN

Version 1.3.X is a major update for the CAIN system focused on FoundryVTT v13 compatibility, improved accessibility, and enhanced talisman management. This version represents a collaborative effort between bugeso and loupgarou.

Features include but are not limited too:

- **FoundryVTT v13 Compatibility**: Full support for FoundryVTT v13 with backward compatibility for v11 and v12
- **Enhanced Talisman System**:
  - Talisman tiles now update automatically when switching scenes
  - Added "Delete All Tiles" functionality for easier talisman management
  - Enhanced create tile button with improved icons and visual feedback
  - Talismans properly sync data when scenes change
- **Improved Accessibility**:
  - Enhanced input field and dropdown readability with better contrast
  - Improved checkbox styles for better visibility
  - Adjusted sidebar margins for more consistent layout
  - Better text legibility across all sheet types
- **Compendium Updates**:
  - GFF3 Agendas fully integrated
  - GFF3 Blasphemies fully integrated
  - Updated afflictions compendium with new entries
  - All compendium packs now use standardized _source JSON format
- **Sin System Completion**: Full 1.3 sin system implementation (v1.3.3+)
- **GitHub Actions Integration**: Automated release workflow with pull request details
- **General Polish**: Various bug fixes, quality-of-life improvements, and much more throughout the system

If you have any questions or concerns about v1.3, reach out on discord @bugeso!

## v1.2.X Update

v1.2.X update is a rework of the sin-sheet, adjustments to the player character sheet and addition of globaltalismans linked to tiles in game. 

This update has features included but not limited too:
- Trauma Questions can now be checked off and are now sorted out line by line on the sheet of the sin
- Sins fields have all been updated to smart text boxes for better customization and edits.
- Sins Now have 6 Quick Action buttons to automate several player interactions (More to be added in future updates)
- Talismans can now be seen on Sin Sheet directly if you want to link them.
- Sins now have expanded views of severe attack and can add your own questions for extra fun!
- Sin page formatting improved.
- Players stats are now shown as bubbles and not numbers. Stats were added to localization document. (Further work needed)
- Talismans can now be put inside of the scene and can be edited as such.
- Fixed Spelling Errors on Hound.
- Fixed Spelling Errors in Homebrew.

## v1.1.X Update

Version 1.1.X update is a rework of the item sheet, blasphemies, agendas, sin-marks, and afflictions. All of these items have now been itemized, and we are able to further update better automation into the system moving forward. 

Features are included but not limited too: 

- Re-work of sheet aesthetics to better fit accessibility needs.
- Re-coloring and re-designing the look of blasphmies, as well as letting you customize your own
- Kit has been re-styled and icons have been updated.
- Homebrew page for Agenda and blasphemies for easy to create home-brew content.
- Afflictions are now items, and afflictions can now be added onto sheet by dragging them on.
- Sin-mark re-haul, automatic sin-mark rolling, and improved sin-mark roll system.
- Agendas are now semi-automated. You drag an agenda onto sheet, it will automate the process of adding in agenda items.
- Blasphmies are now semi-automated, You drag blasphmies onto your sheet and it will automate the process of adding in abilities etc.
- XP managment has been vastly improved with automated xp advancment, xp maximum increase and decrease, and end of session XP bonuses.
- Added in some settings for player managment to be more accessible.


## Migrating to v1.1.X 

If you are coming from an older version of the system here is what you have to know:
We have completley re-worked items, and they are **Mandatory** for the new system work. Details are below when importing the new items, and remember **KEEP DOCUMENT IDS**
When updating, I highly, highly suggest deleting all of your old items and adding the new ones. 
In addition to this, you may have to wipe some parts of actor-sheets.
I would take screenshots of what you had before and replicate them back to the now standard items that are needed. 

Things that will most definitley  be wiped off your old character sheets are:
------------------
1. Agendas
2. Blasphemies
3. Sin Marks
4. Afflictions


Overall, the rest of your game should be un-changed on the game-master side. 

As a side note, it will definitley be in a 1.2.X update where we re-haul sins and improve functionality. This may not be for some time as we perfect the player portion of the game. 
If you have any questions, message in the foundry vtt channel. Thank you! 


##  Overview

Cain is an open-source project designed to streamline CAIN RPG player, GM and system management within FoundryVTT. Cain enhances user experiences through customizable actors, items, and effects. The project's core functionalities, encapsulated in the `cain` module, facilitate dynamic talisman management, item roll logic, and interactive character sheet customization.

### FoundryVTT Compatibility

The CAIN system is fully compatible with:
- **FoundryVTT v11** - Full support with stable features
- **FoundryVTT v12** - Full support with stable features
- **FoundryVTT v13** - Full support (see [V13_COMPATIBILITY.md](V13_COMPATIBILITY.md) for migration notes)

The system maintains backward compatibility across these versions, ensuring a smooth experience whether you're running the latest FoundryVTT release or an earlier stable version. 

---

# Read here if you plan on installing Cain

## Downloading and Installing the Cain System for Foundry VTT

The Cain system is setup through a manifest file that is downloaded and put onto your foundry.

### Obtaining the Manifest URL

Head over to the Cain system.json GitHub repository: [Cain System Module](https://github.com/diabeatz96/cain/blob/main/system.json)


**Here's how to find the manifest URL:**

On the top right corner of the code, there is a RAW button. 

<img width="1664" alt="image" src="https://github.com/user-attachments/assets/c5242a98-1cff-4f41-9368-e3c32172ec59">

Then, proceed to copy the link at the top. 

<img width="478" alt="image" src="https://github.com/user-attachments/assets/1757dc5b-7194-4342-97c2-d91f2079688e">


### Installing the Cain System in Foundry VTT

* Launch your Foundry VTT instance.
* Navigate to the "Game Systems" menu (gear icon in the top right corner).
* Click install system
* Copy paste the link into manifest url


https://github.com/user-attachments/assets/035fbb43-5e0c-4ed6-970d-b3dd6f9d6909

### **Creating a World**
  1. Click the "Game Worlds" button and then click "Create World".
  2. Fill in info.
  3. Click Create World



https://github.com/user-attachments/assets/88cb39a3-a235-4c6b-9f56-ebfbcff463fa


### **Importing Compendium Information**

* Go to Compendium tab (Book with world looking icon).
* Right click on each pack and click import content, **CLICK KEEP DOCUMENT IDS** then click yes.


**YOU MUST KEEP DOCUMENT IDS, THIS IS CRITICAL TO THE SYSTEM WORKING AS INTENDED.**



https://github.com/user-attachments/assets/464240a1-7d6c-49f0-b68e-6415b091d353


## Investigations

 - [Operation Weeping Mountain](https://github.com/diabeatz96/operation-weeping-mountain)


# Developers
##  Features

|    |   Feature         | Description |
|----|-------------------|---------------------------------------------------------------|
| ⚙️  | **Architecture**  | Modular FoundryVTT system architecture with clear separation between documents, sheets, helpers, and data models. Utilizes SASS for styling and ES6 modules for JavaScript functionality. Built on FoundryVTT v11, v12, and v13 APIs for efficient actor and item management.|
| 🔩 | **Code Quality**  | Clean, maintainable codebase with reusable components and consistent design patterns. Uses modern JavaScript (ES6+) with class-based architecture extending FoundryVTT base classes. Follows FoundryVTT best practices for document manipulation and UI rendering.|
| 📄 | **Documentation** | Comprehensive system.json metadata, template.json schema definitions, and localization support. Includes detailed actor templates for characters, NPCs, and sins, plus item templates for equipment, talismans, agendas, blasphemies, and afflictions.|
| 🔌 | **Integrations**  | Native FoundryVTT v11/v12/v13 integration with Handlebars templating engine, active effects system, and compendium packs. SASS compilation for advanced styling. Supports drag-and-drop item management and automated character sheet updates.|
| 🧩 | **Modularity**    | Highly modular structure with separate modules for actors, items, sheets, helpers, and data models. Custom document classes extend FoundryVTT base types. Template partials enable component reuse across different sheet types.|
| 🎮 | **Game Features** | Custom sin tracking system, talisman management with tile integration, automated agenda and blasphemy application, sin-mark rolling mechanics, XP advancement system, and trauma tracking. Includes homebrew content creation tools.|
| ⚡️  | **Performance**   | Optimized rendering through cached Handlebars templates and efficient data preparation methods. Minimal DOM manipulation and strategic use of FoundryVTT's built-in update cycles. Compressed assets and streamlined CSS.|
| 🎨 | **UI/UX**        | Custom-styled character sheets with tabbed interfaces for stats, items, abilities, sin tracking, and talismans. Responsive design with bubble-based stat display, interactive controls, and Jujutsu Kaisen-themed talisman window.|
| 📦 | **Dependencies**  | FoundryVTT v11/v12/v13 core API, SASS for CSS preprocessing, Handlebars for template rendering. No external npm dependencies required for runtime. Development dependencies include node-sass for build process.|
| 🚀 | **Compatibility** | Full support for FoundryVTT v11, v12, and v13. Backward-compatible data structures with migration support between versions. Works with standard FoundryVTT modules and doesn't conflict with core functionality.|

---

##  Repository Structure

```sh
└── cain/
    ├── CHANGELOG.md                     # Version history and update notes
    ├── CODE_OF_CONDUCT.md               # Community guidelines
    ├── LICENSE.txt                      # MIT license for code, separate license for compendium content
    ├── README.md                        # This file
    ├── V13_COMPATIBILITY.md             # FoundryVTT v13 compatibility notes
    ├── assets/                          # Game assets and images
    │   ├── Agendas/                     # Agenda artwork
    │   ├── Blasphemies/                 # Blasphemy artwork
    │   ├── CAT/                         # Character art and tokens
    │   ├── exorcist/                    # Exorcist-related assets
    │   ├── investigations/              # Investigation module assets
    │   ├── items/                       # Item icons
    │   ├── KIT/                         # Kit/equipment artwork
    │   ├── psyche/                      # Psyche ability icons
    │   ├── rolls/                       # Dice roll interface assets
    │   ├── sheet/                       # Character sheet backgrounds
    │   ├── sin-marks/                   # Sin mark icons
    │   ├── Sins/                        # Sin-related artwork
    │   ├── Talismans/                   # Talisman icons
    │   └── Tutorial/                    # Tutorial assets
    ├── css/
    │   └── cain.css                     # Compiled CSS from SCSS source
    ├── lang/
    │   └── en.json                      # English localization strings
    ├── lib/
    │   └── some-lib/                    # Third-party library dependencies
    ├── module/                          # Core JavaScript modules
    │   ├── cain.mjs                     # Main entry point, system initialization
    │   ├── data/                        # Data model definitions
    │   │   ├── _module.mjs              # Data module exports
    │   │   ├── base-actor.mjs           # Base actor data model
    │   │   ├── base-item.mjs            # Base item data model
    │   │   ├── base-model.mjs           # Base data model class
    │   │   ├── actor-character.mjs      # Character actor data
    │   │   ├── actor-mundane.mjs        # Mundane actor data
    │   │   ├── actor-npc.mjs            # NPC actor data
    │   │   ├── item-*.mjs               # Various item type data models
    │   │   ├── afflictions/             # Affliction data models
    │   │   ├── agenda/                  # Agenda data models (tasks, abilities)
    │   │   ├── blasphemy/               # Blasphemy data models (powers)
    │   │   └── sins/                    # Sin mark data models
    │   ├── documents/                   # Document extension classes
    │   │   ├── actor.mjs                # Extended Actor document class
    │   │   ├── item.mjs                 # Extended Item document with roll logic
    │   │   ├── homebrew-window.mjs      # Homebrew content creation UI
    │   │   ├── player-overview.mjs      # Player overview interface
    │   │   ├── session-end-advancement.mjs  # Session XP advancement UI
    │   │   └── talisman-window.mjs      # Talisman management UI
    │   ├── helpers/                     # Helper utilities
    │   │   ├── config.mjs               # System configuration (skills, abilities, sin marks)
    │   │   ├── effects.mjs              # Active effects management
    │   │   ├── index-offset.mjs         # Index calculation helpers
    │   │   ├── standard_event_assignment_shortcuts.mjs  # Event handling shortcuts
    │   │   └── templates.mjs            # Handlebars template preloader
    │   └── sheets/                      # Sheet application classes
    │       ├── actor-sheet.mjs          # Base actor sheet logic
    │       └── item-sheet.mjs           # Base item sheet logic
    ├── package.json                     # npm build scripts for SASS compilation
    ├── packs/                           # Compendium packs (LevelDB format)
    │   ├── afflictions/                 # Affliction items compendium
    │   ├── agenda2/                     # Agenda items compendium
    │   ├── blasphemy2/                  # Blasphemy items compendium
    │   ├── cain/                        # Core CAIN content compendium
    │   ├── items/                       # Equipment and gear compendium
    │   ├── sin-marks/                   # Sin mark definitions compendium
    │   └── tables/                      # Rollable tables compendium
    ├── src/
    │   └── scss/                        # SCSS source files
    │       ├── cain.scss                # Main SCSS entry point
    │       ├── components/              # Component-specific styles (_forms, _items, _effects, _resource)
    │       ├── global/                  # Global layout utilities (_grid, _flex, _window)
    │       └── utils/                   # SCSS variables, mixins, colors, typography
    ├── system.json                      # FoundryVTT system manifest
    ├── template.json                    # Actor and Item data schema definitions
    └── templates/                       # Handlebars templates
        ├── actor/                       # Actor sheet templates
        │   ├── actor-character-sheet.hbs
        │   ├── actor-mundane-sheet.hbs
        │   ├── actor-npc-sheet.hbs
        │   ├── npc-parts/               # NPC sheet partials (attacks, domains, palace-pressure)
        │   └── parts/                   # Character sheet partials (items, abilities, sin, talismans)
        ├── item/                        # Item sheet templates
        │   ├── item-affliction-sheet.hbs
        │   ├── item-agenda-sheet.hbs
        │   ├── item-agendaAbility-sheet.hbs
        │   ├── item-agendaTask-sheet.hbs
        │   ├── item-blasphemy-sheet.hbs
        │   ├── item-blasphemyPower-sheet.hbs
        │   ├── item-feature-sheet.hbs
        │   ├── item-item-sheet.hbs
        │   ├── item-sin-mark-sheet.hbs
        │   ├── item-sins-sheet.hbs
        │   ├── item-spell-sheet.hbs
        │   └── parts/                   # Item sheet partials
        ├── homebrew-window.hbs          # Homebrew content creation interface
        ├── player-overview.hbs          # Player overview interface
        ├── session-advancement.hbs      # Session XP advancement interface
        └── talisman-window.hbs          # Global talisman management window
```

---

##  Modules

<details closed><summary>.</summary>

| File                                                                          | Summary                                                                                                                                                                                                                      |
| ---                                                                           | ---                                                                                                                                                                                                                          |
| [package.json](https://github.com/diabeatz96/cain/blob/master/package.json)   | Enables CSS compilation for the Cain system using SASS. Automates the compilation process and enables watching for style changes. Key features include building expanded CSS and supporting source maps.                     |
| [template.json](https://github.com/diabeatz96/cain/blob/master/template.json) | Defines supported types for Actors and Items in the system, guiding the template structure.                                                                                                                                  |
| [LICENSE.txt](https://github.com/diabeatz96/cain/blob/master/LICENSE.txt)     | Defines licensing terms for the repository content, granting usage permissions under the MIT License. Excludes compendium content from this license. Specifies attribution for the image anvil-impact.png.                   |
| [system.json](https://github.com/diabeatz96/cain/blob/master/system.json)     | Defines metadata for the Cain system in FoundryVTT, specifying authors, version, media, compatibility, styles, languages, and more. Facilitates system management, compatibility, and customization for users of the system. |

</details>

<details closed><summary>lib.some-lib</summary>

| File                                                                                           | Summary                                                                                                                                                                                                                                           |
| ---                                                                                            | ---                                                                                                                                                                                                                                               |
| [some-lib.css](https://github.com/diabeatz96/cain/blob/master/lib/some-lib/some-lib.css)       | Enhances Cains UI with reusable styles for various components. Supports maintainability and consistency across the projects frontend, complementing the design system.                                                                            |
| [some-lib.min.js](https://github.com/diabeatz96/cain/blob/master/lib/some-lib/some-lib.min.js) | Enables custom functionality within the system using a compressed JavaScript library, enhancing modularity and extensibility. The file serves as a core component of the repositorys architecture for integrating additional features seamlessly. |

</details>

<details closed><summary>css</summary>

| File                                                                    | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---                                                                     | ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [cain.css](https://github.com/diabeatz96/cain/blob/master/css/cain.css) | Cain/module/cain.mjs`The `cain.mjs` file within the `module` directory of the Cain repository serves as a crucial module orchestrating various functionalities of the system. It acts as a central hub for handling data processing, document management, and providing essential helper functions to streamline operations within the system. This code file integrates key components essential for the overall functioning of the system, promoting efficiency and coherence in managing the systems resources effectively. |

</details>

<details closed><summary>module</summary>

| File                                                                       | Summary                                                                                                                                                                                                                                             |
| ---                                                                        | ---                                                                                                                                                                                                                                                 |
| [cain.mjs](https://github.com/diabeatz96/cain/blob/master/module/cain.mjs) | Defines classes, constants, and macros for the Cain system. Registers document, sheet, and handlebars helpers. Enables item creation and macro assignment. Facilitates talisman interaction through a dedicated window and button on the interface. |

</details>

<details closed><summary>module.documents</summary>

| File                                                                                                       | Summary                                                                                                                                                                                                                                              |
| ---                                                                                                        | ---                                                                                                                                                                                                                                                  |
| [item.mjs](https://github.com/diabeatz96/cain/blob/master/module/documents/item.mjs)                       | Enhances Item class with dynamic data handling and roll logic for dice commands. Extends functionality to simplify system data and handle clickable rolls elegantly in chat interface.                                                               |
| [talisman-window.mjs](https://github.com/diabeatz96/cain/blob/master/module/documents/talisman-window.mjs) | Implements TalismanWindow class for managing global Talismans in the Cain system. Enables GMs to add, edit, and delete talismans with image and mark settings. Supports dynamic image and mark updates based on user interactions.                   |
| [actor.mjs](https://github.com/diabeatz96/cain/blob/master/module/documents/actor.mjs)                     | Defines a custom data structure for the Actor document, enhancing data handling for the Simple system in the Cain repository. Extends base Actor functionalities to prepare, augment, and convert data efficiently for character sheets and queries. |

</details>

<details closed><summary>module.helpers</summary>

| File                                                                                         | Summary                                                                                                                                                                                                         |
| ---                                                                                          | ---                                                                                                                                                                                                             |
| [effects.mjs](https://github.com/diabeatz96/cain/blob/master/module/helpers/effects.mjs)     | Manages Active Effects for Actor/Item Sheets with control buttons to create, edit, delete, or toggle effects. Prepares data structure for categorizing effects into temporary, passive, or inactive categories. |
| [templates.mjs](https://github.com/diabeatz96/cain/blob/master/module/helpers/templates.mjs) | Loads and caches Handlebars templates to enable fast rendering in the Cain system. Pre-loads template paths for talismans, actors, and items, enhancing performance for displaying game elements.               |
| [config.mjs](https://github.com/diabeatz96/cain/blob/master/module/helpers/config.mjs)       | Defines registered skills, sin marks and abilities used in the system, enhancing gameplay mechanics with rich character customization options and thematic depth.                                               |

</details>

<details closed><summary>module.sheets</summary>

| File                                                                                            | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---                                                                                             | ---                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [actor-sheet.mjs](https://github.com/diabeatz96/cain/blob/master/module/sheets/actor-sheet.mjs) | This code file, located in the `module/sheets` directory, enhances the functionality related to managing active effects for actors within the larger `cain` repository. It imports key functions for managing active effects and retrieving configuration settings. By leveraging these imports, the code streamlines the process of organizing and preparing active effect categories, contributing to a more efficient and user-friendly system for handling actor-related data within the project. |
| [item-sheet.mjs](https://github.com/diabeatz96/cain/blob/master/module/sheets/item-sheet.mjs)   | Enhances ItemSheet presentation with dynamic templating, enriched descriptions, system flags, and active effects management. Integrates contextual data and UI enhancements for interactive item manipulation within the larger Cain repository.                                                                                                                                                                                                                                                      |

</details>

<details closed><summary>src.scss</summary>

| File                                                                           | Summary                                                                                                                                                                                                                                                     |
| ---                                                                            | ---                                                                                                                                                                                                                                                         |
| [cain.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/cain.scss) | Enhances styling for the `cain` module by importing custom fonts, utilities, and global styles. Organizes components related to forms, resources, items, and effects within the `.cain` class, streamlining the visual presentation in the Cain repository. |

</details>

<details closed><summary>src.scss.components</summary>

| File                                                                                                | Summary                                                                                                                                                                                                                                  |
| ---                                                                                                 | ---                                                                                                                                                                                                                                      |
| [_resource.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/components/_resource.scss) | Defines bold styling for resource labels in the repositorys SCSS components, enhancing readability and visual hierarchy.                                                                                                                 |
| [_forms.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/components/_forms.scss)       | Styles sheet for forms and headers in the Cain module. Defines layout properties for form items, profile images, header fields, character names, tabs, and text editors. Maintains a consistent visual design within the user interface. |
| [_effects.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/components/_effects.scss)   | Defines centralized styling for item effects in Cain modules UI components. Aligns content, adds borders, and sets font size. Enhances visual consistency and readability for effect-related elements.                                   |
| [_items.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/components/_items.scss)       | Styles components for items in the UI, defining headers, lists, names, controls, and individual items. Enhances readability and user interaction.                                                                                        |

</details>

<details closed><summary>src.scss.global</summary>

| File                                                                                        | Summary                                                                                                                                                                                                                               |
| ---                                                                                         | ---                                                                                                                                                                                                                                   |
| [_grid.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/global/_grid.scss)     | Defines grid layouts for responsive web design, offering columns ranging from 2 to 12. Includes grid offsets for alignment control. Supports dynamic content structuring for enhanced user experiences within the application.        |
| [_flex.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/global/_flex.scss)     | Enhances layout flexibility with centralized alignment and spacing options using Flexbox properties. Establishes consistent design patterns for center, left, and right alignments, optimizing UI rendering for diverse screen sizes. |
| [_window.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/global/_window.scss) | Window-app` uses primary font, `rollable` elements change color and shadow on hover/focus. Contributes consistent UI styling for interactive elements aiding user engagement in the projects UI development.                          |

</details>

<details closed><summary>src.scss.utils</summary>

| File                                                                                               | Summary                                                                                                                                                                                                                              |
| ---                                                                                                | ---                                                                                                                                                                                                                                  |
| [_variables.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/utils/_variables.scss)   | Define padding and border styles variables for consistent UI spacing and elements in the Cain repositorys styling layer.                                                                                                             |
| [_mixins.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/utils/_mixins.scss)         | Defines mixins for hiding elements in the repositorys CSS architecture. Supports accessibility and UI design by providing reusable utilities for making elements visually hidden or completely hidden from view.                     |
| [_colors.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/utils/_colors.scss)         | Defines core color variables for consistent styling in the repositorys SCSS files. Establishes essential color values such as white, black, dark, faint, beige, and tan for maintaining a cohesive design system across the project. |
| [_typography.scss](https://github.com/diabeatz96/cain/blob/master/src/scss/utils/_typography.scss) | Defines primary and secondary fonts for consistent typography in the parent repositorys stylesheets. Ensures a unified visual language across the project to enhance readability and brand consistency.                              |

</details>

<details closed><summary>lang</summary>

| File                                                                   | Summary                                                                                                                                                                                                    |
| ---                                                                    | ---                                                                                                                                                                                                        |
| [en.json](https://github.com/diabeatz96/cain/blob/master/lang/en.json) | Define localization strings for skills, abilities, labels, items, and effects in English within the en.json file for the Cain system, facilitating user interface display in the respective game elements. |

</details>

<details closed><summary>templates</summary>

| File                                                                                                | Summary                                                                                                                                                                                                                                                          |
| ---                                                                                                 | ---                                                                                                                                                                                                                                                              |
| [talisman-window.hbs](https://github.com/diabeatz96/cain/blob/master/templates/talisman-window.hbs) | Defines a stylized UI layout for managing Global Talismans. Displays talisman details dynamically, with GM-exclusive controls. Applies custom styling for a Jujutsu Kaisen-themed interface, enhancing user experience within the cain module of the repository. |

</details>

<details closed><summary>templates.actor</summary>

| File                                                                                                                  | Summary                                                                                                                                                                                                                               |
| ---                                                                                                                   | ---                                                                                                                                                                                                                                   |
| [actor-npc-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/actor-npc-sheet.hbs)             | Implements an NPC character sheet with editable fields for health, power, CR/XP, biography, and owned items. Facilitates interactive character management in the RPG system through a visually appealing and user-friendly interface. |
| [actor-character-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/actor-character-sheet.hbs) | Renders a character sheet with profile information and tabs for managing stats, descriptions, items, abilities, sin, and talismans. Utilizes Handlebars for dynamic content display in the Cain repositorys actor template structure. |

</details>

<details closed><summary>templates.actor.parts</summary>

| File                                                                                                            | Summary                                                                                                                                                                                                                                                   |
| ---                                                                                                             | ---                                                                                                                                                                                                                                                       |
| [actor-items.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/parts/actor-items.hbs)         | Renders kit points and scrip amount inputs.-Displays gear items with controls for creation, editing, and deletion.-Utilizes CSS styling for a visually appealing and consistent layout.                                                                   |
| [actor-talismans.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/parts/actor-talismans.hbs) | Renders a dynamic interface for managing talismans in the actor profile, displaying talisman details with controls to edit and delete. Allows users to add new talismans.                                                                                 |
| [actor-abilities.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/parts/actor-abilities.hbs) | Renders dynamic content for displaying and managing Psyche and item sections within the actor abilities UI component. Dynamically generates buttons, checkboxes, and lists based on system data for engaging user interactions and customization options. |
| [actor-features.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/parts/actor-features.hbs)   | Designs and styles a dynamic character sheet interface with checkboxes, sliders, and dice roller functionality.-Displays character progression indicators and prompts for XP advancement decisions, enhancing the immersive role-playing experience.      |
| [actor-sin.hbs](https://github.com/diabeatz96/cain/blob/master/templates/actor/parts/actor-sin.hbs)             | Enables tracking and management of sin overflow and sin marks for characters. Allows setting max value, checking overflow, rolling sin marks, and clearing/deleting marks. Supports dynamic display based on character data.                              |

</details>

<details closed><summary>templates.item</summary>

| File                                                                                                               | Summary                                                                                                                                                                                                                                                                                                |
| ---                                                                                                                | ---                                                                                                                                                                                                                                                                                                    |
| [item-feature-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-feature-sheet.hbs)     | Enhances item feature sheets by displaying item details, enabling interactive editing, and integrating with a system for enriched text handling. Facilitates easy navigation through tabs for description, attributes, and effects, streamlining user interaction within the repositorys architecture. |
| [item-item-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-item-sheet.hbs)           | Customizes item details for an RPG character sheet, integrating image, resource quantities, type, and descriptions. Facilitates seamless editing and organization with tabbed navigation for descriptions and attributes, enhancing gameplay experience.                                               |
| [item-spell-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-spell-sheet.hbs)         | Empowers spell management by providing tabs for description and attributes. Includes an editor for enriched text data and fields for spell level input. Enhances user experience for customizing and organizing spell information in the system.                                                       |
| [item-agenda-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-agenda-sheet.hbs)       | Displays a fallback template for items lacking specific ones. Features a customizable form with item name input. Includes tab navigation for Description section with rich text editing capabilities for system descriptions.                                                                          |
| [item-blasphemy-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-blasphemy-sheet.hbs) | Enables customization of item details and effects in Cains system through a user-friendly interface with tabs for description, attributes, and effects. Facilitates seamless navigation and editing of items with dynamic content.                                                                     |
| [item-sheet.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/item-sheet.hbs)                     | Defines the fallback template for items without specific ones. Displays item details, such as name and image. Offers tab navigation for Description and Attributes sections, supporting enriched text data editing. Maintains modularity for easy addition of new fields.                              |

</details>

<details closed><summary>templates.item.parts</summary>

| File                                                                                                     | Summary                                                                                                                                                                                                                                           |
| ---                                                                                                      | ---                                                                                                                                                                                                                                               |
| [item-effects.hbs](https://github.com/diabeatz96/cain/blob/master/templates/item/parts/item-effects.hbs) | Renders a dynamic list of item effects with controls for creation, editing, and deletion. Incorporates localized labels and icons for each effect, enhancing user interaction within the item management module of the greater repository system. |

</details>

---

##  Getting Started


###  Installation

<h4>From <code>source</code></h4>

> 1. Clone the cain repository:
>
> ```console
> $ git clone https://github.com/diabeatz96/cain
> ```
>
> 2. Change to the project directory:
> ```console
> $ cd cain
> ```

##  Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Report Issues](https://github.com/diabeatz96/cain/issues)**: Submit bugs found or log feature requests for the `cain` project.
- **[Submit Pull Requests](https://github.com/diabeatz96/cain/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.
- **[Join the Discussions](https://github.com/diabeatz96/cain/discussions)**: Share your insights, provide feedback, or ask questions.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/diabeatz96/cain
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="center">
   <a href="https://github.com{/diabeatz96/cain/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=diabeatz96/cain">
   </a>
</p>
</details>

---

##  License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

##  Acknowledgments

   - Tom Bloom Creator of Cain
   - Adam Kostandy (Diabeatz96) - Original creator and lead developer of the repository
   - Myco from the Pilot.NET/CAIN Discord for providing icon assets
   - My sunday DND group
   - My friend carmen for miscellaneous ideas and polish
   - ahandleman and Benji as developers
   - bugeso and loupgarou for development contributions and v1.3 updates


[**Return**](#-overview)

---
