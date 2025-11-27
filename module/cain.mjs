// Import document classes.
import { CainActor } from './documents/actor.mjs';
import { CainItem } from './documents/item.mjs';
import { TalismanWindow } from './documents/talisman-window.mjs';
import { HomebrewWindow } from './documents/homebrew-window.mjs';
// Import sheet classes.
import { CainActorSheet } from './sheets/actor-sheet.mjs';
import { CainItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { CAIN } from './helpers/config.mjs';
import { PlayerOverview } from './documents/player-overview.mjs';

// Import DataModel classes
import * as models from './data/_module.mjs';
import PathosTracker from "./components/pathos-tracker/pathos-tracker.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */


Hooks.once('init', async function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.cain = {
    CainActor,
    CainItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.CAIN = CAIN;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = CainActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.CainCharacter,
    sin: models.CainNPC,
    mundane: models.CainMundane,
    npc: models.CainNPC,  // Backwards compatibility - deprecated, use 'sin' instead
  }
  CONFIG.Item.documentClass = CainItem;
  CONFIG.Item.dataModels = {
    item: models.CainItem,
    agenda: models.CainAgenda,
    blasphemy: models.CainBlasphemy,
    blasphemyPower: models.CainBlasphemyPower,
    agendaTask: models.CainAgendaTask,
    agendaAbility: models.CainAgendaAbility,
    sinMark: models.CainSinMark,
    sinMarkAbility: models.CainSinMarkAbility,
    affliction: models.CainAffliction,
  }
  
  console.log('CAIN | Initializing Cain system');
  console.log(CONFIG)
  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('cain', CainActorSheet, {
    makeDefault: true,
    label: 'CAIN.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('cain', CainItemSheet, {
    makeDefault: true,
    label: 'CAIN.SheetLabels.Item',
  });

  game.settings.register('cain', 'globalTalismans', {
    name: 'Global Talismans',
    scope: 'world',
    config: false,
    type: Array,
    default: [
      {
        name: 'Execution',
        imagePath: 'systems/cain/assets/Talismans/Talisman-A-0.png',
        currMarkAmount: 0,
        minMarkAmount: 0,
        maxMarkAmount: 2,
        isHidden: false,
      },
    ],
  });

  game.settings.register('cain', "GMTutorialFinished", {
    name: "GM Tutorial Finished",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register('cain', 'homebrewHistory', {
    name: 'Homebrew Creation History',
    scope: 'world',
    config: false,
    type: Array,
    default: []
  });

  game.settings.register('cain', 'homebrewFolderSettings', {
    name: 'Homebrew Folder Settings',
    scope: 'world',
    config: false,
    type: Object,
    default: {
      agendaFolder: '',
      blasphemyFolder: '',
      powerFolder: '',
      afflictionFolder: '',
      itemFolder: '',
      sinMarkFolder: '',
      importFolder: ''
    }
  });

  game.settings.register('cain', 'hasAutoImportedCompendiums', {
    name: "Has Auto-Imported Compendiums",
    hint: "Tracks whether compendiums have been automatically imported to this world",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register('cain', 'showPlayerOverview', {
    name: 'Show Player Overview Button',
    hint: 'Allow players to see the player overview button.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      ui.players.render();
    }
  });

  game.settings.register('cain', 'developerMode', {
    name: 'Enable Developer Mode',
    hint: 'Shows a lot of ugly debug information that allows direct modification of values.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      ui.players.render();
    }
  });

  
  game.settings.register('cain', 'accessibilityModeChosen', {
    name: 'Accessibility Mode Chosen',
      scope: 'client',
      config: false,
      type: Boolean,
      default: false,
    });

  game.settings.register('cain', 'accessibilityMode', {
    name: 'Enable Accessibility Mode',
    hint: 'Toggle accessibility colors and changes for the player sheet.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
    onChange: value => {
      applyAccessibilityMode(value);
    }
  });

  game.settings.register('cain', 'pathosTrackerVisible', {
    name: 'Pathos Tracker Visible',
    scope: 'client',
    config: false,
    type: Boolean,
    default: true,
  });

  function registerHotkeySetting(settingName, settingLabel, settingHint) {
    game.settings.register('cain', settingName, {
      name: settingLabel,
      hint: settingHint,
      scope: 'client',
      config: true,
      type: String,
      default: '',
      onChange: value => {
        document.getElementById(`${settingName}-display`).innerText = value || 'Not Set';
      }
    });
  
    Hooks.on('renderSettingsConfig', (app, html, data) => {
      const settingElement = html.find(`[name="cain.${settingName}"]`).parent();
      settingElement.find('input').remove(); // Remove the text input field
  
      const button = $(`
        <button type="button" id="${settingName}-button" style="
          background-color: #4CAF50; 
          border: none; 
          color: white; 
          padding: 10px 24px; 
          text-align: center; 
          text-decoration: none; 
          display: inline-block; 
          font-size: 16px; 
          margin: 4px 2px; 
          cursor: pointer; 
          border-radius: 12px; 
          transition: background-color 0.3s ease;
        ">Set Hotkey</button>
      `);
  
      const display = $(`
        <span id="${settingName}-display" style="
          font-size: 16px; 
          margin-left: 10px; 
          padding: 10px; 
          background-color: #f1f1f1; 
          border: 1px solid #ccc; 
          border-radius: 12px; 
          display: inline-block;
        ">${game.settings.get('cain', settingName) || 'Not Set'}</span>
      `);
      
      button.on('click', () => {
        button.css('background-color', '#45a049'); // Change background color slightly
        function handler(event) {
          event.preventDefault(); // Prevent other keys from triggering
          game.settings.set('cain', settingName, event.key);
          button.css('background-color', '#4CAF50'); // Revert background color
          window.removeEventListener('keydown', handler, true);
        }
        window.addEventListener('keydown', handler, true);
      });
  
      settingElement.append(button);
      settingElement.append(display);
    });
  }
  
  game.settings.register('cain', 'enableHotkeys', {
    name: 'Enable Hotkeys',
    hint: 'Toggle to enable or disable hotkeys.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
  });
  
  registerHotkeySetting('hotkeyTalisman', 'Hotkey for Talisman Button', 'Set a hotkey to trigger the Talisman button.');
  registerHotkeySetting('hotkeyPlayerOverview', 'Hotkey for Player Overview Button', 'Set a hotkey to trigger the Player Overview button.');
  registerHotkeySetting('hotkeyRiskRoll', 'Hotkey for Risk Roll Button', 'Set a hotkey to trigger the Risk Roll button.');
  registerHotkeySetting('hotkeyFateRoll', 'Hotkey for Fate Roll Button', 'Set a hotkey to trigger the Fate Roll button.');
  registerHotkeySetting('hotkeyHomebrew', 'Hotkey for Homebrew Button', 'Set a hotkey to trigger the Homebrew button.');
  
  applyAccessibilityMode(game.settings.get('cain', 'accessibilityMode'));


  const blasphemyPowerTemplate = await getTemplate("systems/cain/templates/item/parts/item-blasphemy-power-sheet.hbs");
  const blasphemyPowerPartialTemplate = await getTemplate("systems/cain/templates/item/parts/item-blasphemy-power-partial.hbs");
  const sinMarkAbilityTemplate = await getTemplate("systems/cain/templates/item/parts/item-sin-mark-partial.hbs");

  Handlebars.registerPartial("sinMarkAbility", sinMarkAbilityTemplate);
  Handlebars.registerPartial("blasphemyPower", blasphemyPowerTemplate);
  Handlebars.registerPartial("blasphemyPowerPartial", blasphemyPowerPartialTemplate);
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

function applyAccessibilityMode(enabled) {
  if (enabled) {
    $('body').addClass('accessibility-mode');
  } else {
    $('body').removeClass('accessibility-mode');
  }
}

/* -------------------------------------------- */
/*  Scene Control Buttons                       */
/* -------------------------------------------- */

// Add Divine Agony toggle to scene controls (works for v12 and v13)
// This hook must be registered outside of ready to catch initial render
Hooks.on('getSceneControlButtons', (controls) => {
  // v13 uses object structure with "tokens" (plural), v12 uses array with "token" (singular)
  const isV13 = game.release.generation >= 13;

  if (isV13) {
    // v13: controls is an object keyed by control name (plural: "tokens"), tools is also an object
    // Reference: https://foundryvtt.com/api/functions/hookEvents.getSceneControlButtons.html
    // v13 onChange signature: (event: Event, active: boolean) => void
    if (controls.tokens) {
      controls.tokens.tools['pathos-tracker'] = {
        name: 'pathos-tracker',
        title: 'Toggle Divine Agony Tracker',
        icon: 'fa-solid fa-heart',
        toggle: true,
        active: game.settings.get('cain', 'pathosTrackerVisible'),
        onChange: async (event, active) => {
          await game.settings.set('cain', 'pathosTrackerVisible', active);
          if (active) {
            ui.pathosTracker.render({ force: true });
          } else {
            ui.pathosTracker.close();
          }
        }
      };
    }
  } else {
    // v12: controls is an array, tools is an array, name is "token" (singular)
    const tokenControls = controls.find(c => c.name === 'token');
    if (tokenControls) {
      tokenControls.tools.push({
        name: 'pathos-tracker',
        title: 'Toggle Divine Agony Tracker',
        icon: 'fa-solid fa-heart',
        toggle: true,
        active: game.settings.get('cain', 'pathosTrackerVisible'),
        onClick: async (active) => {
          await game.settings.set('cain', 'pathosTrackerVisible', active);
          if (active) {
            ui.pathosTracker.render({ force: true });
          } else {
            ui.pathosTracker.close();
          }
        }
      });
    }
  }
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('range', function(start, end, options) {
  let accum = '';
  for (let i = start; i < end; ++i) {
    accum += options.fn({ index: i });
  }
  return accum;
});

Handlebars.registerHelper('filter', function(items, type) {
  return items.filter(item => item.type === type);
});

Handlebars.registerHelper('hasItemsOfType', function(items, type, options) {
  const hasItems = items.some(item => item.type === type);
  return hasItems ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('calcPercentage', function(curr, max) {
  return (curr / max) * 100;
});

Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 1; i <= n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === (n - 1);
      accum += block.fn(this);
  }
  return accum;
});

// Utility function to format CAT text - can be used outside of Handlebars
window.formatCatText = function(text, category) {
  const categoryTable = [
    {
      'CAT': 0,
      'people': 'one',
      'size': 'human',
      'area': 'personal',
      'range': 'touch',
      'speed': 'average human',
      'magnitude': 'small'
    },
    {
      'CAT': 1,
      'people': 'a few',
      'size': 'heavy furniture',
      'area': 'a few people',
      'range': 'same room',
      'speed': 'fast human',
      'magnitude': 'Noticable'
    },
    {
      'CAT': 2,
      'people': 'small group',
      'size': 'large animal',
      'area': 'entire room',
      'range': 'accross the street',
      'speed': 'fast animal',
      'magnitude': 'large'
    },
    {
      'CAT': 3,
      'people': 'large group',
      'size': 'vehicle',
      'area': 'few rooms',
      'range': 'down the block',
      'speed': 'car',
      'magnitude': 'very large'
    },
    {
      'CAT': 4,
      'people': 'a crowd',
      'size': 'large vehicle',
      'area': 'whole building',
      'range': 'a few blocks away',
      'speed': 'train',
      'magnitude': 'massive'
    },
    {
      'CAT': 5,
      'people': 'a huge crowd',
      'size': 'building',
      'area': 'city block',
      'range': 'across town',
      'speed': 'maglev',
      'magnitude': 'destructive'
    },
    {
      'CAT': 6,
      'people': 'thousands',
      'size': 'large building',
      'area': 'whole neighborhood',
      'range': 'visual range',
      'speed': 'airliner',
      'magnitude': 'overwhelming'
    },
    {
      'CAT': 7,
      'people': 'many thousands',
      'size': 'skyscraper',
      'area': 'whole town',
      'range': 'over the horizon',
      'speed': 'jet fighter',
      'magnitude': 'cataclysmic'
    }
  ]
  // Check if the text is defined and is a string
  let parse_cat_values = (inputString => {
    // Updated regex to support CAT operations like CAT/2, CAT*2, CAT+1, CAT-1
    const regex = /\{<CAT([\/\*\+\-]\d+)?>\s+(\S+)\s+(\S+)\}/g;

    const matches = [...inputString.matchAll(regex)];

    return matches.map(match => ({
        string: Handlebars.escapeExpression(match[0]),
        operation: match[1] || '', // e.g., "/2", "*2", "+1", "-1", or empty string
        type: match[2],
        modifier: match[3]
    }));
  });

  

  if (typeof text === 'string') {
      const CatFormattingData = parse_cat_values(text);
      //TODO: fix hardcoded category limits - it'd be nice to have the option to expand Category beyond 0-7
      let updatedText = Handlebars.escapeExpression(text);
      if (isNaN(category) || Number(category) < 0 || Number(category) > 7) {
        CatFormattingData.forEach(catData => {
          const operationText = catData.operation ? catData.operation : '';
          const replacementString = `<span><b> CAT${operationText}${(catData.modifier <=  0 ? '' : '+') + (catData.modifier == 0 ? '' : catData.modifier)}</b></span>`;
          updatedText = updatedText.replace(catData.string, replacementString)
        })
      } else {
        CatFormattingData.forEach(catData => {
          // Apply the operation to the category value first
          let operatedCat = Number(category);
          let calculationSteps = [];

          // Build calculation explanation
          calculationSteps.push(`Base CAT: ${category}`);

          if (catData.operation) {
            const operator = catData.operation.charAt(0);
            const operand = Number(catData.operation.slice(1));

            switch(operator) {
              case '/':
                const beforeCeil = operatedCat / operand;
                operatedCat = Math.ceil(beforeCeil);
                calculationSteps.push(`${category} / ${operand} = ${beforeCeil.toFixed(2)} → ${operatedCat} (rounded up)`);
                break;
              case '*':
                operatedCat = operatedCat * operand;
                calculationSteps.push(`${category} * ${operand} = ${operatedCat}`);
                break;
              case '+':
                operatedCat = operatedCat + operand;
                calculationSteps.push(`${category} + ${operand} = ${operatedCat}`);
                break;
              case '-':
                operatedCat = operatedCat - operand;
                calculationSteps.push(`${category} - ${operand} = ${operatedCat}`);
                break;
            }
          }

          // Then apply the modifier
          const beforeModifier = operatedCat;
          const finalCat = operatedCat + Number(catData.modifier);
          if (Number(catData.modifier) !== 0) {
            calculationSteps.push(`${beforeModifier} ${catData.modifier > 0 ? '+' : ''} ${catData.modifier} = ${finalCat}`);
          }

          const catIndex = Math.max(Math.min(finalCat, 7), 0);
          if (finalCat < 0 || finalCat > 7) {
            calculationSteps.push(`Clamped to CAT ${catIndex} (min 0, max 7)`);
          }

          calculationSteps.push(`Result: ${categoryTable[catIndex][catData.type]}`);

          const tooltipText = calculationSteps.join(' | ');
          const operationText = catData.operation ? catData.operation : '';
          const replacementString = `<span data-tooltip="${tooltipText}" style="cursor: help; border-bottom: 1px dotted #ff00cc;"><img style="vertical-align: middle; max-height: 2em; display: inline-block; border: none;" src="systems/cain/assets/CAT/CAT${category}.png"/> <b>${categoryTable[catIndex][catData.type]}</b> <img style="vertical-align: middle; max-height: 2em; display: inline-block; border: none;" src="systems/cain/assets/CAT/CAT${category}.png"/> </span>`;
          console.log(replacementString);
          updatedText = updatedText.replace(catData.string, replacementString)
        })
      }

      //Allow user text to have bolds and italics because they won't pose security issues.
      updatedText = updatedText.split(Handlebars.escapeExpression("<b>")).join("<b>");
      updatedText = updatedText.split(Handlebars.escapeExpression("</b>")).join("</b>");
      updatedText = updatedText.split(Handlebars.escapeExpression("<i>")).join("<i>");
      updatedText = updatedText.split(Handlebars.escapeExpression("</i>")).join("</i>");

      // Replace all newlines with <br> tags
      return updatedText.replace(/\n/g, '<br>');
  } else {
      return text; // Return the text as is if it's not a string
  }
};

// Handlebars helper wrapper for formatCatText
Handlebars.registerHelper('formatted', function(text, category) {
  return new Handlebars.SafeString(window.formatCatText(text, category));
});

Handlebars.registerHelper('mod', function(value, modval, options){
  if(value===undefined || modval===undefined || parseInt(value) === NaN || !parseInt(modval) === NaN){
    throw new Error(`Mod helper did not receive a number: val=${value}, modval=${modval}`);
  }
  return parseInt(value) % parseInt(modval)
});


Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

Handlebars.registerHelper('CainOffset', function(value, offset, options) {
  if(value===undefined || offset===undefined || parseInt(value)===NaN || !parseInt(offset) === NaN){
    throw new Error(`offset helper did not receive a number: val=${value}, offset=${offset}`);
  }
  return parseInt(value) + parseInt(offset);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */


Hooks.once('ready', async function () {
  // Function to create and insert the Talisman button
  function addPlayerOverviewButton() {
    const showPlayerOverview = game.settings.get('cain', 'showPlayerOverview');
    const isGM = game.user.isGM;
  
    // If the user is not a GM and the setting is false, do not add the button
    if (!isGM && !showPlayerOverview) return;
  
    const button = $('<button title="Player Overview" class="player-overview-button"><img src="systems/cain/assets/player-overview.png" alt="Player Overview"></button>');
    button.on('click', () => {
      new PlayerOverview().render(true);
    });
  
    const aside = $('<aside class="talisman-container"></aside>').append(button);
    const actionBar = $('#action-bar');
    if (actionBar.length) {
      actionBar.append(aside);
      console.log('Player Overview button inserted successfully.');
    } else {
      console.error('Action bar not found.');
    }
  }

  // add the pathos tracker UI element
  const pathos = new PathosTracker();

  // Only render if visible setting is true
  if (game.settings.get('cain', 'pathosTrackerVisible')) {
    pathos.render({ force: true });
  }

  // register to the UI element
  ui.pathosTracker = pathos;

  function addTalismanButton() {
    // Create the button element with the talisman icon
    const button = $('<button title="Global Talismans" class="talisman-button"><img src="systems/cain/assets/talisman-icon.png" alt="Talisman Icon"></button>');
    
    // Add click event to open the TalismanWindow
    button.on('click', () => {
      new TalismanWindow().render(true);
    });

    // Create an aside element and append the button to it
    const aside = $('<aside class="talisman-container"></aside>').append(button);

    // Insert the aside element into the action bar
    const actionBar = $('#action-bar');
    if (actionBar.length) {
      actionBar.append(aside);
      console.log('Talisman button inserted successfully.');
    } else {
      console.error('Action bar not found.');
    }
  }

  function addHomebrewButton() {
    // Create the button element with the talisman icon
    if (!game.user.isGM) return;
    const button = $('<button title="Homebrew" class="homebrew-button"><img src="systems/cain/assets/homebrew.png" alt="Homebrew Icon"></button>');
    
    // Add click event to open the HomebrewWindow
    button.on('click', () => {
      new HomebrewWindow().render(true);
    });

    // Create an aside element and append the button to it
    const aside = $('<aside class="talisman-container"></aside>').append(button);

    // Insert the aside element into the action bar
    const actionBar = $('#action-bar');
    if (actionBar.length) {
      actionBar.append(aside);
      console.log('Homebrew button inserted successfully.');
    } else {
      console.error('Action bar not found.');
    }
  }

  // Function to create and insert the Risk Roll button
  function addRiskRollButton() {
    if (!game.user.isGM) return;

    const riskRollButton = $('<button title="Risky Dice" class="risk-roll-button"><img src="systems/cain/assets/rolls/risky.png" alt="Risk Roll Icon"></button>');
    riskRollButton.on('click', handleRiskRoll);

    const aside = $('<aside class="talisman-container"></aside>').append(riskRollButton);
    const actionBar = $('#action-bar');
    if (actionBar.length) {
      actionBar.append(aside);
      console.log('Risk Roll button inserted successfully.');
    } else {
      console.error('Action bar not found.');
    }
  }

  // Function to create and insert the Fate Roll button
  function addFateRollButton() {
    if (!game.user.isGM) return;

    const fateRollButton = $('<button title = "Fate Roll" class="fate-roll-button"><img src="systems/cain/assets/rolls/fate.png" alt="Fate Roll Icon"></button>');
    fateRollButton.on('click', handleFateRoll);

    const aside = $('<aside class="talisman-container"></aside>').append(fateRollButton);
    const actionBar = $('#action-bar');
    if (actionBar.length) {
      actionBar.append(aside);
      console.log('Fate Roll button inserted successfully.');
    } else {
      console.error('Action bar not found.');
    }
  }

  // Add the Talisman button when the action bar is first ready
  addTalismanButton();
  addPlayerOverviewButton();
  // Add the Risk Roll and Fate Roll buttons when the action bar is first ready
  addRiskRollButton();
  addFateRollButton();
  addHomebrewButton();

  // Ensure the buttons are added every time the action bar is rendered
  Hooks.on('renderHotbar', () => {
    addTalismanButton();
    addRiskRollButton();
    addFateRollButton();
    addHomebrewButton();
  });

  // Register hotbar drop hook
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

  // Automatic compendium import on world creation
  await checkAndImportCompendiums();

  // Add event listeners for hotkeys
  document.addEventListener('keydown', (event) => {
    // Ignore key events when typing in input fields or ProseMirror editors
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.classList.contains('ProseMirror')) return;

    // Check if hotkeys are enabled
    if (!game.settings.get('cain', 'enableHotkeys')) return;

    const talismanHotkey = game.settings.get('cain', 'hotkeyTalisman');
    const playerOverviewHotkey = game.settings.get('cain', 'hotkeyPlayerOverview');
    const riskRollHotkey = game.settings.get('cain', 'hotkeyRiskRoll');
    const fateRollHotkey = game.settings.get('cain', 'hotkeyFateRoll');
    const homebrewHotkey = game.settings.get('cain', 'hotkeyHomebrew');

    if (event.key === talismanHotkey) {
      $('.talisman-button').click();
    } else if (event.key === playerOverviewHotkey) {
      $('.player-overview-button').click();
    } else if (event.key === riskRollHotkey) {
      $('.risk-roll-button').click();
    } else if (event.key === fateRollHotkey) {
      $('.fate-roll-button').click();
    } else if (event.key === homebrewHotkey) {
      $('.homebrew-button').click();
    }
  });

  const [brokenBlasphemies, brokenSinMarks, brokenAgendas] = testForProperLinkage();
  if (brokenBlasphemies || brokenSinMarks || brokenAgendas) {
    const dialogContent = `
      <div style="text-align: center;">
        <h2>Error in Item Linkage</h2>
        <p> Checked for issues with linking abilities and found issues in <b>${brokenBlasphemies ? "blasphemies " : ""}${brokenAgendas ? "agendas " : ""}${brokenSinMarks ? "sin marks" : ""}</b>.  These issues may cause the system to not function properly.  To fix, re-import any broken packs by deleting them from the items tab, then importing the packs. <br> <h3>Be sure to check the box that says keep item IDs</h3><br>If it still doesn't work, please reach out on discord or github.</p>
      </div>
    `;

    let dialog = new Dialog({
      title: 'Error in Item Linkage',
      content: dialogContent,
      buttons: {ok: {label: "Understood"}},
      close: () => {},
    });
    dialog.render(true);
  }
});

async function checkAndImportCompendiums() {
  // Check if this is a fresh world (no items imported yet)
  // We use a setting to track if we've already auto-imported
  const hasAutoImported = game.settings.get('cain', 'hasAutoImportedCompendiums');

  if (hasAutoImported) {
    console.log('CAIN | Compendiums already auto-imported');
    return;
  }

  // Check if there are any items already in the world
  const hasExistingItems = game.items.size > 0;

  if (hasExistingItems) {
    // Items already exist, mark as imported so we don't auto-import in the future
    await game.settings.set('cain', 'hasAutoImportedCompendiums', true);
    console.log('CAIN | Items already exist, skipping auto-import');
    return;
  }

  // Only GMs can import compendiums
  if (!game.user.isGM) {
    console.log('CAIN | Only GMs can auto-import compendiums');
    return;
  }

  console.log('CAIN | Starting automatic compendium import...');

  // Send initial chat message
  await ChatMessage.create({
    speaker: { alias: "CAIN System" },
    content: `<div style="background: #2a2a2a; border: 2px solid #ff6666; padding: 15px; border-radius: 8px; color: #fff;">
      <h2 style="margin: 0 0 10px 0; color: #ff8888; text-shadow: 0 0 2px rgba(255,136,136,0.5);">Automatic Compendium Import</h2>
      <p style="margin: 5px 0; color: #e0e0e0;">Starting automatic import of all game content...</p>
      <p style="margin: 5px 0; font-size: 0.9em; color: #bbb;">This may take a moment. Please wait...</p>
    </div>`
  });

  // Define the compendiums to import in order
  const compendiumsToImport = [
    { key: 'cain.items', label: 'Kit and Items' },
    { key: 'cain.blasphemies', label: 'Blasphemies' },
    { key: 'cain.agendas', label: 'Agendas' },
    { key: 'cain.sin-marks', label: 'Sin Marks' },
    { key: 'cain.afflictions', label: 'Afflictions' },
    { key: 'cain.tables', label: 'Roll Tables' }
  ];

  let totalImported = 0;
  const importResults = [];

  try {
    for (const compendiumInfo of compendiumsToImport) {
      const pack = game.packs.get(compendiumInfo.key);

      if (!pack) {
        console.warn(`CAIN | Compendium ${compendiumInfo.key} not found`);
        importResults.push(`<li style="color: #ff9900;">${compendiumInfo.label}: <b>Not Found</b></li>`);
        continue;
      }

      console.log(`CAIN | Importing ${compendiumInfo.label}...`);

      // Import all documents from the pack with keepId option to preserve document IDs
      const documents = await pack.importAll({ keepId: true });
      const importCount = documents.length;
      totalImported += importCount;

      importResults.push(`<li style="color: #44ff44;">${compendiumInfo.label}: <b>${importCount} items</b></li>`);

      console.log(`CAIN | Imported ${importCount} items from ${compendiumInfo.label}`);
    }

    // Mark as imported
    await game.settings.set('cain', 'hasAutoImportedCompendiums', true);

    // Send completion message
    await ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div style="background: #2a2a2a; border: 2px solid #66ff66; padding: 15px; border-radius: 8px; color: #fff;">
        <h2 style="margin: 0 0 10px 0; color: #88ff88; text-shadow: 0 0 2px rgba(136,255,136,0.5);">Import Complete!</h2>
        <p style="margin: 5px 0; color: #e0e0e0;">Successfully imported all game content:</p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #e0e0e0;">
          ${importResults.join('')}
        </ul>
        <p style="margin: 10px 0 5px 0; font-weight: bold; color: #e0e0e0;">Total: ${totalImported} items imported</p>
        <p style="margin: 5px 0; font-size: 0.9em; color: #bbb;">All items are now ready to use in your world!</p>
      </div>`
    });

    ui.notifications.info(`CAIN | Successfully imported ${totalImported} items from compendiums`);
    console.log(`CAIN | Automatic import completed: ${totalImported} items imported`);

  } catch (error) {
    console.error('CAIN | Error during automatic import:', error);

    await ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div style="background: #2a2a2a; border: 2px solid #ff6666; padding: 15px; border-radius: 8px; color: #fff;">
        <h2 style="margin: 0 0 10px 0; color: #ff8888; text-shadow: 0 0 2px rgba(255,136,136,0.5);">Import Error</h2>
        <p style="margin: 5px 0; color: #e0e0e0;">An error occurred during automatic import.</p>
        <p style="margin: 5px 0; font-size: 0.9em; color: #bbb;">Please try importing manually from the compendiums.</p>
      </div>`
    });

    ui.notifications.error('CAIN | Error during automatic compendium import. Check console for details.');
  }
}

function testForProperLinkage() {
  const brokenBlasphemies = (game.items
    .filter(item => {return item.type === "blasphemy";}) //find blasphemies
    .map(blasphemy => {return blasphemy.system.powers;}) //get powers
    .flat() //flatten
    .filter(powerID => {return !game.items.get(powerID)}) //check if any of those powers are invalid
    .length > 0); //if so, true
  const brokenSinMarks = (game.items
    .filter(item => {return item.type === "sinMark";}) //find sin marks
    .map(sinMark => {return sinMark.system.abilities;}) //get abilities
    .flat() //flatten
    .filter(powerID => {return !game.items.get(powerID)}) //check if any of those powers are invalid
    .length > 0); //if so, true
  const brokenAgendas = (game.items
    .filter(item => {return item.type === "agenda";}) //find sin marks
    .map(agenda => {return agenda.system.abilities;}) //get abilities
    .flat() //flatten
    .filter(powerID => {return !game.items.get(powerID)}) //check if any of those powers are invalid
    .length > 0); //if so, true
    console.log("Blasphemies: " + brokenBlasphemies);
    console.log("SinMarks: " + brokenSinMarks);
    console.log("Agendas: " + brokenAgendas);
  if (brokenBlasphemies) { // if one is broken, go through and create a log of all the different broken powers for debugging purposes
    const badBlasphemies = game.items
      .filter(item => {return item.type === "blasphemy";}) //find blasphemies
      .filter(blasphemy => {return testItemsFromIDs(blasphemy.system.powers);}) //find those with broken abilities
      .map(blasphemy => {return blasphemy.name;});
    console.warn("Errors with linkage in blasphemies: " + badBlasphemies);
  }
  if (brokenAgendas) {
    const badAgendas = game.items
      .filter(item => {return item.type === "agenda";}) //find agendas
      .filter(agenda => {return testItemsFromIDs(agenda.system.abilities);}) //find those with broken abilities
      .map(agenda => {return agenda.name;});
    console.warn("Errors with linkage in agendas: " + badAgendas);
  }
  if (brokenSinMarks) {
    const badSinMarks = game.items
      .filter(item => {return item.type === "sinMark";}) //find agendas
      .filter(mark => {return testItemsFromIDs(mark.system.abilities);}) //find those with broken abilities
      .map(mark => {return mark.name;});
    console.warn("Errors with linkage in marks: " + badSinMarks);
  }
  return [brokenBlasphemies, brokenSinMarks, brokenAgendas];
};

function testItemsFromIDs(ids) {
  return (ids.filter(id => {return !game.items.get(id);}).length > 0);
};


// Function to handle Risk Roll
async function handleRiskRoll() {
  const roll = await new Roll('1d6').roll();
  let resultText;
  let resultColor;
  switch (roll.total) {
    case 1:
      resultText = "Much Worse";
      resultColor = "red";
      break;
    case 2:
    case 3:
      resultText = "Worse";
      resultColor = "orange";
      break;
    case 4:
    case 5:
      resultText = "Expected";
      resultColor = "yellow";
      break;
    case 6:
      resultText = "Better";
      resultColor = "green";
      break;
  }
  const htmlContent = `
    <div class="chat-message risk-roll-result" style="background: #333; border: 1px solid #555; padding: 10px; border-radius: 5px; margin-top: 10px; color: #ddd;">
      <h2 style="margin: 0 0 5px 0; font-size: 1.2em; color: #fff;">Risk Roll</h2>
      <p style="margin: 5px 0; font-size: 1em;"><strong>Result:</strong> <span style="color: ${resultColor};">${roll.total}</span></p>
      <p style="margin: 5px 0; font-size: 1em;"><strong>Outcome:</strong> <span style="color: ${resultColor};">${resultText}</span></p>
    </div>
  `;
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: htmlContent
  });
}

// Function to handle Fate Roll
async function handleFateRoll() {
  const roll = await new Roll('1d6').roll();
  let resultText;
  let resultColor;
  switch (roll.total) {
    case 1:
      resultText = "Poorest result";
      resultColor = "red";
      break;
    case 2:
    case 3:
      resultText = "Poor result";
      resultColor = "orange";
      break;
    case 4:
    case 5:
      resultText = "Good result";
      resultColor = "yellow";
      break;
    case 6:
      resultText = "Best result";
      resultColor = "green";
      break;
  }
  const htmlContent = `
    <div class="fate-roll-result" style="background: #333; border: 1px solid #555; padding: 10px; border-radius: 5px; margin-top: 10px; color: #ddd;">
      <h2 style="margin: 0 0 5px 0; font-size: 1.2em; color: #fff;">Fate Roll</h2>
      <p style="margin: 5px 0; font-size: 1em;"><strong>Result:</strong> <span style="color: ${resultColor};">${roll.total}</span></p>
      <p style="margin: 5px 0; font-size: 1em;"><strong>Outcome:</strong> <span style="color: ${resultColor};">${resultText}</span></p>
    </div>
  `;
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: htmlContent
  });
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.cain.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'cain.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

function showGMTutorialDialog() {
  const dialogContent = `
    <div style="text-align: center;">
      <h2>Welcome to the CAIN system!</h2>
      <p>It looks like you're a GM and this is your first time using the CAIN system. Would you like to go through a quick tutorial?</p>
      <p>This tutorial will guide you through the basics of the system and show you how to use some of the features.</p>
    </div>
  `;

  let dialog = new Dialog({
    title: 'Welcome to CAIN!',
    content: dialogContent,
    buttons: {
      yes: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Yes',
        callback: () => {
          game.settings.set('cain', 'GMTutorialFinished', true);
          showGMTutorialSteps();
        },
      },
      no: {
        icon: '<i class="fas fa-times"></i>',
        label: 'No',
        callback: () => {
          game.settings.set('cain', 'GMTutorialFinished', false);
        },
      },
    },
    default: 'yes',
  });

  dialog.render(true);
}

function showGMTutorialSteps() {
  console.log('Showing GM tutorial steps');
  const steps = [
    {
      title: 'Game Content Import',
      content: `
        <h2>Automatic Import Complete!</h2>
        <p>All game content has been automatically imported for you:</p>
        <ul>
          <li>Kit and Items</li>
          <li>Blasphemies</li>
          <li>Agendas</li>
          <li>Sin Marks</li>
          <li>Afflictions</li>
          <li>Roll Tables</li>
        </ul>
        <p><b>No manual import needed!</b> All items are ready to use in your world.</p>
        <p style="font-size: 0.9em; color: #888;">The system automatically imported everything while preserving document IDs.</p>
      `,
    },
    {
      title: 'Using the Talisman Window',
      content: `
        <p>Click on the Talisman button in the action bar to open the Talisman Window.</p>
        <p>Use the Talisman Window to manage global talismans.</p>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/talisman-icon.png" alt="Talisman Icon" style="max-height: 4em; display: inline-block; border: none;">
        </span>
      `,
    },
    {
      title: 'Using the Player Overview',
      content: `
        <p>Click on the Player Overview button in the action bar to open the Player Overview.</p>
        <p>Use the Player Overview to view player stats and abilities.</p>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/player-overview.png" alt="Player Overview Icon" style="max-height: 4em; display: inline-block; border: none;">
        </span>
      `,
    },
    {
      title: 'Using the Risk Roll',
      content: `
        <p>Click on the Risk Roll button in the action bar to roll a risky dice.</p>
        <p>Use the Risk Roll to determine the outcome of risky actions.</p>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/rolls/risky.png" alt="Risk Roll Icon" style="max-height: 4em; display: inline-block; border: none;">
        </span>
      `,
    },
    {
      title: 'Using the Fate Roll',
      content: `
        <p>Click on the Fate Roll button in the action bar to roll a fate dice.</p>
        <p>Use the Fate Roll to determine the outcome of fate-related events.</p>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/rolls/fate.png" alt="Fate Roll Icon" style="max-height: 4em; display: inline-block; border: none;">
        </span>
      `,
    },
    {
      title: 'Using the Homebrew Window',
      content: `
        <p>Click on the Homebrew button in the action bar to open the Homebrew Window.</p>
        <p>Use the Homebrew Window to create and manage homebrew content.</p>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/homebrew.png" alt="Homebrew Icon" style="max-height: 4em; display: inline-block; border: none;">
        </span>
      `,
    },
    {
      title: 'Final Tips',
      content: `
        <ol>
          <li>All game content has been automatically imported for you!</li>
          <li>Remember to give your players user permissions for items so they can see them</li>
          <li>Create Sins and Exorcists in the Actors Tab</li>
          <li>Have fun and enjoy the game!</li>
        </ol>
      `,
    },
    {
      title: 'Finished!',
      content: `
        <p>That's it! You've completed the GM tutorial for the CAIN system.</p>
        <p>Feel free to explore the system and if you have any questions post in the pilot.net discord cain-vtt channel</p>
      `,
    }
  ];

  let currentStep = 0;

  function renderDialog() {
    const dialogContent = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="margin-bottom: 10px;">Step ${currentStep + 1} of ${steps.length}</h2>
        <h3 style="margin-bottom: 20px;">${steps[currentStep].title}</h3>
        <div style="text-align: left;">${steps[currentStep].content}</div>
      </div>
    `;
    let dialog = new Dialog({
      title: 'CAIN GM Tutorial',
      content: dialogContent,
      buttons: {
        next: {
          icon: '<i class="fas fa-arrow-right"></i>',
          label: currentStep < steps.length - 1 ? 'Next' : 'Finish',
          callback: () => {
            currentStep++;
            if (currentStep < steps.length) {
              renderDialog();
            } else {
              dialog.close();
            }
          },
        },
      },
      default: 'next',
    });

    dialog.render(true);
  }

  renderDialog();
}

function showAccessibilityChoiceDialog() {
  const dialogContent = `
    <div style="text-align: center;">
      <h2>Choose Your Preferred Style Mode</h2>
      <div style="display: flex; justify-content: space-around; margin-top: 20px;">
        <div>
          <img src="systems/cain/assets/UI_Normal.png" alt="Styled Mode" style="cursor: pointer;" id="normal-mode">
          <p>UNDER//HEAVEN</p>
        </div>
        <div>
          <img src="systems/cain/assets/UI_Plain.png" alt="Accessibility Mode" style="cursor: pointer;" id="accessibility-mode">
          <p>CAIN</p>
        </div>
      </div>
      <p style="margin-top: 20px;">You can always change your preferred style in the settings.</p>
    </div>
  `;

  let dialog = new Dialog({
    title: 'Accessibility Mode',
    content: dialogContent,
    buttons: {},
    close: () => {},
    render: html => {
      dialog.setPosition({ width: 800, height: 550 });

      const normalModeImg = document.getElementById('normal-mode');
      const accessibilityModeImg = document.getElementById('accessibility-mode');

      normalModeImg.addEventListener('mouseover', () => {
        normalModeImg.style.filter = 'brightness(1.2)';
        accessibilityModeImg.style.filter = 'brightness(0.5)';
      });

      normalModeImg.addEventListener('mouseout', () => {
        normalModeImg.style.filter = 'brightness(1)';
        accessibilityModeImg.style.filter = 'brightness(1)';
      });

      accessibilityModeImg.addEventListener('mouseover', () => {
        accessibilityModeImg.style.filter = 'brightness(1.2)';
        normalModeImg.style.filter = 'brightness(0.5)';
      });

      accessibilityModeImg.addEventListener('mouseout', () => {
        accessibilityModeImg.style.filter = 'brightness(1)';
        normalModeImg.style.filter = 'brightness(1)';
      });

      normalModeImg.addEventListener('click', () => {
        game.settings.set('cain', 'accessibilityMode', false);
        game.settings.set('cain', 'accessibilityModeChosen', true);
        applyAccessibilityMode(false);
        ui.notifications.info('Style Mode selected.');
        dialog.close();
      });

      accessibilityModeImg.addEventListener('click', () => {
        game.settings.set('cain', 'accessibilityMode', true);
        game.settings.set('cain', 'accessibilityModeChosen', true);
        applyAccessibilityMode(true);
        ui.notifications.info('Accessibility Mode selected.');
        dialog.close();
      });
    },
  });

  dialog.render(true);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
