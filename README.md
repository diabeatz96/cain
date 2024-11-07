<p align="center">
  <img src="https://img.itch.zone/aW1nLzE3MTg0NDA0LnBuZw==/original/UyMCiP.png" width="400" alt="project-logo">
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
   <img alt="Static Badge" src="https://img.shields.io/badge/foundry-v12-blue">
<p>
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
    - Myco from the Pilot.NET/CAIN Discord for providing icon assets
    - Tom Bloom Creator of Cain
    - My sunday DND group
    - My friend carmen for miscellaneous ideas and polish
    - Diabeatz96, ahandleman and Benji as developers.

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

Cain is an open-source project designed to streamline CAIN RPG player, gm and system management within FoundryVTT. Cain enhances user experiences through customizable actors, items, and effects. The projects core functionalities, encapsulated in the `cain` module, facilitate dynamic talisman management, item roll logic, and interactive character sheet customization. 

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
| ⚙️  | **Architecture**  | The project has a modular architecture with clear separation of concerns, utilizing Sass for styling and JavaScript for functionality. It follows a structured system design in FoundryVTT for efficient data processing and management.   |
| 🔩 | **Code Quality**  | The codebase maintains high quality standards with reusable styles, compressed JavaScript libraries, and efficient data handling. It follows a consistent design system for frontend elements, enhancing maintainability and coherence across the project.|
| 📄 | **Documentation** | Extensive documentation is provided, defining metadata, supported types, licensing terms, and localization strings. Detailed explanations are present for classes, helpers, templates, and components, aiding system management, customization, and user interface design.|
| 🔌 | **Integrations**  | Key integrations include SASS for CSS compilation, Handlebars templates for fast rendering, and FoundryVTT for system metadata. External dependencies support dynamic image updates, active effects management, and talisman interaction within the system.|
| 🧩 | **Modularity**    | The codebase exhibits high modularity, enabling easy extension and integration of additional features. Classes, templates, and styles are organized in a structured manner, promoting code reusability and scalability for future enhancements.|
| 🧪 | **Testing**       | Testing frameworks and tools used are not explicitly mentioned in the provided details.|
| ⚡️  | **Performance**   | The system promotes efficiency and resource optimization through centralized code management, dynamic data handling, and fast rendering using cached Handlebars templates. Layout elements are designed for responsive web display, enhancing user experiences in the application.|
| 🛡️ | **Security**      | Security measures for data protection and access control are not explicitly discussed in the provided details.|
| 📦 | **Dependencies**  | Key external libraries and dependencies include SASS for CSS compilation, Handlebars for template rendering, and FoundryVTT for managing system metadata and UI components. These libraries enhance styling, performance, and functionality within the project.|
| 🚀 | **Scalability**   | The project demonstrates scalability with its structured architecture, modularity, and efficient resource management. The codebase is well-organized for handling increased traffic and load, facilitating easy integration of new features and extensions.|

---

##  Repository Structure

```sh
└── cain/
    ├── CHANGELOG.md
    ├── LICENSE.txt
    ├── README.md
    ├── assets
    │   ├── CAT
    │   ├── Talismans
    │   ├── anvil-impact.png
    │   ├── brain.png
    │   └── talisman-icon.png
    ├── css
    │   └── cain.css
    ├── lang
    │   └── en.json
    ├── lib
    │   └── some-lib
    ├── module
    │   ├── cain.mjs
    │   ├── data
    │   ├── documents
    │   ├── helpers
    │   └── sheets
    ├── package.json
    ├── packs
    │   └── .gitattributes
    ├── src
    │   └── scss
    ├── system.json
    ├── template.json
    └── templates
        ├── actor
        ├── item
        └── talisman-window.hbs
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

   - Myco from the Pilot.NET/CAIN Discord for providing icon assets
   - Tom Bloom Creator of Cain
   - My sunday DND group


[**Return**](#-overview)

---
