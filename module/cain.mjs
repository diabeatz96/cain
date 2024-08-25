// Import document classes.
import { CainActor } from './documents/actor.mjs';
import { CainItem } from './documents/item.mjs';
import { TalismanWindow } from './documents/talisman-window.mjs';
// Import sheet classes.
import { CainActorSheet } from './sheets/actor-sheet.mjs';
import { CainItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { CAIN } from './helpers/config.mjs';
import { PlayerOverview } from './documents/player-overview.mjs';

// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
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
    npc: models.CainNPC,
    mundane: models.CainMundane,
  }
  CONFIG.Item.documentClass = CainItem;
  CONFIG.Item.dataModels = {
    item: models.CainItem,
    agenda: models.CainAgenda,
    blasphemy: models.CainBlasphemy,
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

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
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

Handlebars.registerHelper('set', function(context, key, value, options) {
  context[key] = value;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Function to create and insert the Talisman button

  function addPlayerOverviewButton() {
    const button = $('<button title="Player Overview" class="player-overview-button"><i class="fas fa-users"></i></button>');
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

  // Ensure the buttons are added every time the action bar is rendered
  Hooks.on('renderHotbar', () => {
    addTalismanButton();
    addRiskRollButton();
    addFateRollButton();
  });

  // Register hotbar drop hook
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

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
    <div class="risk-roll-result" style="background: #333; border: 1px solid #555; padding: 10px; border-radius: 5px; margin-top: 10px; color: #ddd;">
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
