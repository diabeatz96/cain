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
    npc: models.CainNPC,
    mundane: models.CainMundane,
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

Handlebars.registerHelper('formatted', function(text, category) {
  // console.log(category);
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
    const regex = /\{<CAT>\s+(\S+)\s+(\S+)\}/g;

    const matches = [...inputString.matchAll(regex)];

    return matches.map(match => ({
        string: Handlebars.escapeExpression(match[0]),
        type: match[1],
        modifier: match[2]
    }));
  });

  

  if (typeof text === 'string') {
      const CatFormattingData = parse_cat_values(text);
      //TODO: fix hardcoded category limits - it'd be nice to have the option to expand Category beyond 0-7
      let updatedText = Handlebars.escapeExpression(text);
      if (isNaN(category) || Number(category) < 0 || Number(category) > 7) {
        CatFormattingData.forEach(catData => {
          const replacementString = `<span><b> CAT${(catData.modifier <=  0 ? '' : '+') + (catData.modifier == 0 ? '' : catData.modifier)}</b></span>`;
          updatedText = updatedText.replace(catData.string, replacementString)
        })
      } else {
        CatFormattingData.forEach(catData => {
          const catIndex = Math.max(Math.min(Number(category) + Number(catData.modifier), 7), 0);
          const replacementString = `<span title="CAT${(catData.modifier <=  0 ? '' : '+') + (catData.modifier == 0 ? '' : catData.modifier)}"><img style="vertical-align: middle; max-height: 2em; display: inline-block; border: none;" src="systems/cain/assets/CAT/CAT${category}.png"/> <b>${categoryTable[catIndex][catData.type]}</b> <img style="vertical-align: middle; max-height: 2em; display: inline-block; border: none;" src="systems/cain/assets/CAT/CAT${category}.png"/> </span>`;
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
      return new Handlebars.SafeString(updatedText.replace(/\n/g, '<br>'));
  } else {
      return text; // Return the text as is if it's not a string
  }
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


Hooks.once('ready', function () {
  // Function to create and insert the Talisman button

  const accessibilityModeChosen = game.settings.get('cain', 'accessibilityModeChosen');
  if (!accessibilityModeChosen) {
    showAccessibilityChoiceDialog();
  }

  const GMtutorialFinished = game.settings.get('cain', 'GMTutorialFinished');
  if (!GMtutorialFinished && game.user.isGM) {
    showGMTutorialDialog();
  }

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
    const button = $('<button title="Homebrew" class="talisman-button"><img src="systems/cain/assets/homebrew.png" alt="Homebrew Icon"></button>');
    
    // Add click event to open the TalismanWindow
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
      title: 'Importing Game Content',
      content: `
        <h1> THIS IS EXTREMELY IMPORTANT FIRST STEP </h1>
        <ul>
          <li>Click on the compendium tab</li>
          <li>Right click on each compendium and click import content</li>
          <li>YOU MUST CLICK KEEP DOCUMENT IDS OR THE SYSTEM WON'T WORK</li>
        </ul>
        <span style="display: flex; justify-content: center;">
          <img src="systems/cain/assets/Tutorial/doc_ids.png" alt="Keep Document IDs" style="display: inline-block; border: none;">
        </span>
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
          <li>Remember to import game content from the compendiums. WITH DOCUMENT IDS</li>
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
          <p>Stylish Mode</p>
        </div>
        <div>
          <img src="systems/cain/assets/UI_Plain.png" alt="Accessibility Mode" style="cursor: pointer;" id="accessibility-mode">
          <p>Accessibility Mode</p>
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
