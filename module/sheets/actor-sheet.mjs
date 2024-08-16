import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

import { CAIN } from '../helpers/config.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CainActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cain', 'sheet', 'actor'],
      width: 900,
      height: 750,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/cain/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.document.toPlainObject();
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.CAIN;

    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        secrets: this.document.isOwner,
        async: true,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      }
    );

    context.effects = prepareActiveEffectCategories(
      this.actor.allApplicableEffects()
    );

    this._calculateRanges(context);

    return context;
  }

  _prepareCharacterData(context) {
    // Character-specific data preparation
  }

  _prepareItems(context) {
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'item') {
        gear.push(i);
      } else if (i.type === 'feature') {
        features.push(i);
      } else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  _calculateRanges(context) {
    context.items.forEach(item => {
      if (item.system.range) {
        item.system.rangeValue = this._parseRange(item.system.range);
      }
    });
  }

  _parseRange(range) {
    const match = range.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });
  
    if (!this.isEditable) return;
  
    html.on('click', '.item-create', this._onItemCreate.bind(this));
    html.on('click', '.create-agenda-button', this._onItemCreate.bind(this));    
    html.on('click', '.create-blasphemy-button', this._onItemCreate.bind(this));

    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
  
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });
  
    html.on('click', '.rollable', this._onRoll.bind(this));
    html.on('click', '.roll-button button', this._onRollButtonClick.bind(this));

    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
        
    // Checkbox logic
    html.find('.checkbox-group input[type="checkbox"]').on('change', (event) => {
      const field = event.currentTarget.closest('.checkbox-group').dataset.field;
      const checkboxes = html.find(`.checkbox-group[data-field="${field}"] input[type="checkbox"]`);
      let value = 0;
  
      checkboxes.each((index, cb) => {
        if (cb.checked) value = index + 1;
      });
  
      // Update the corresponding field value
      this.actor.update({ [`system.${field}.value`]: value });
    });
  
    // Character sheet specific listeners
    html.find('.item-description').click(this._onItemDescription.bind(this));
    html.find('.sinOverflow-checkbox').change(this._onOverflowChange.bind(this));
    html.find('.psyche-roll-button').click(this._onRollPsyche.bind(this));
    html.find('.psyche-burst-checkbox').change(this._onPsycheBurstChange.bind(this));
    html.find('.kit-points-checkbox').change(this._onKitPointsChange.bind(this));
    html.find('.clear-sin-marks').click(this._clearSinMarks.bind(this));
    html.find('.delete-sin-mark').click(this._deleteSinMark.bind(this));
    html.find('.roll-sin-mark').click(this._rollSinMark.bind(this));
    html.find('.talisman-name').change(this._onInputChange.bind(this));
    html.find('.talisman-curr-mark-amount').change(this._onInputChange.bind(this));
    html.find('.talisman-min-mark-amount').change(this._onInputChange.bind(this));
    html.find('.talisman-max-mark-amount').change(this._onInputChange.bind(this));
    html.find('.talisman-slider').on('input', this._onSliderChange.bind(this));
    html.find('#add-talisman').click(this._onAddTalisman.bind(this));
    html.find('.delete-talisman').click(this._onDeleteTalisman.bind(this));
    html.find('.increase-marks').click(this._onIncreaseMarks.bind(this));
    html.find('.change-image').click(this._onChangeImage.bind(this));
    html.find('.talisman-image').click(this._onImageClick.bind(this));
    html.find('.talisman-image').on('contextmenu', this._onDecreaseMarks.bind(this));


    // NPC sheet specific listeners
    
    html.find('#sinTypeSelect').change(event => {
      const sinType = event.target.value;
      this._onSinTypeSelect(sinType);
    });

}
  
  _onInputChange(event) {
    const index = event.currentTarget.dataset.index;
    const field = event.currentTarget.className.split('-')[1];
    const value = event.currentTarget.value;
    const talismans = this.actor.system.talismans || [];
    talismans[index][field] = value;
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }

  _onPsycheBurstChange(event) {
    const checkboxes = document.querySelectorAll('.psyche-burst-checkbox');
    const isChecked = event.currentTarget.checked;
    let newValue = 0;

    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        newValue++;
      }
    });

    console.log(isChecked);
    console.log(newValue);

    this.actor.update({ 'system.psycheBurst.value': newValue }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });

  }
  


  _onRollButtonClick(event) {
    const skill = document.querySelector('select[name="system.skill"]').value;

    // Get the checkbox values
    const useDivineAgony = document.querySelector('input[name="use-divine-agony"]').checked;
    const teamwork = document.querySelector('input[name="teamwork"]').checked;
    const setup = document.querySelector('input[name="setup"]').checked;
    const hard = document.querySelector('input[name="hard"]').checked;

    // Get the extra dice value
    const extraDice = parseInt(document.querySelector('input[name="extra-dice"]').value) || 0;

    // Perform the roll
    this._performRoll(skill, useDivineAgony, teamwork, setup, hard, extraDice); 
  }
  
  async _performRoll(skill, useDivineAgony, teamwork, setup, hard, extraDice) {
    const TWIST = new foundry.dice.MersenneTwister(Date.now());
    const baseDice = this.actor.system.skills[skill].value;
    let totalDice = baseDice + extraDice + (teamwork ? 1 : 0) + (setup ? 1 : 0);
  
    if (useDivineAgony) {
      const divineAgonyStat = this.actor.system.divineAgony.value; // Replace with the actual path to the divine agony stat
      totalDice += divineAgonyStat;
      this.actor.update({ 'system.divineAgony.value': 0 }); // Set divine agony to zero
    }
  
    console.log(`Total dice: ${totalDice}`);
  
    let roll;
    if (totalDice > 0) {
      roll = new Roll(`${totalDice}d6`);
    } else {
      roll = new Roll(`2d6`);
    }
    await roll.evaluate({ async: true });
  
    console.log(roll.dice[0].results);
  
    let rollResult;
    if (totalDice > 0) {
      rollResult = roll.dice[0].results.reduce((acc, r) => acc + r.result, 0);
    } else {
      rollResult = Math.min(...roll.dice[0].results.map(r => r.result));
    }
  
    let successes;
    if (totalDice > 0) {
      successes = roll.dice[0].results.filter(r => hard ? r.result === 6 : r.result >= 4).length;
    } else {
      successes = rollResult >= 4 ? 1 : 0;
    }

    if(successes === 0 && this.actor.system.divineAgony.value < 3) {
      this.actor.update({'system.divineAgony.value' : this.actor.system.divineAgony.value + 1});
    }

  
    let message = `<h2>${skill.charAt(0).toUpperCase() + skill.slice(1)} Roll</h2>`;
    message += `<p>Successes: <span style="color:${successes > 0 ? 'green' : 'red'}">${successes}</span></p>`;
    message += `<p>Dice Rolled:</p><ul>`;
    roll.dice[0].results.forEach(r => {
      message += `<li>Die: ${r.result} ${r.result === 6 ? '🎲' : ''}</li>`;
    });
    message += `</ul>`;
  
    console.log(`Successes: ${successes}`);
  
    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }

  _onRollPsyche(event) {
    event.preventDefault();
    
    // Create a dialog to prompt the user for additional dice and hard roll option
    new Dialog({
      title: "Psyche Roll",
      content: `
        <form>
          <div class="form-group">
            <label for="additional-dice">Additional Dice:</label>
            <input type="number" id="additional-dice" name="additional-dice" min="0" value="0"/>
          </div>
          <div class="form-group">
            <label for="hard-roll">Hard Roll (only 6's count as success):</label>
            <input type="checkbox" id="hard-roll" name="hard-roll"/>
          </div>
        </form>
      `,
      buttons: {
        roll: {
          icon: "<i class='fas fa-dice'></i>",
          label: "Roll",
          callback: (html) => {
            const additionalDice = parseInt(html.find('[name="additional-dice"]').val()) || 0;
            const hardRoll = html.find('[name="hard-roll"]').is(':checked');
            this._performPsycheRoll(additionalDice, hardRoll);
          }
        },
        cancel: {
          icon: "<i class='fas fa-times'></i>",
          label: "Cancel"
        }
      },
      default: "roll"
    }).render(true);
  }
  
  async _performPsycheRoll(additionalDice, hardRoll) {
    const TWIST = new foundry.dice.MersenneTwister(Date.now());
    const psyche = this.actor.system.psyche || 1;
    const totalDice = Math.max(psyche + additionalDice, 0); // Ensure totalDice is not below 0
    console.log(`Total dice: ${totalDice}`);
  
    let roll;
    if (totalDice > 0) {
      roll = new Roll(`${totalDice}d6`);
    } else {
      roll = new Roll(`2d6`);
    }
    await roll.evaluate({ async: true });
  
    console.log(roll.dice[0].results);
  
    let successes = roll.dice[0].results.filter(r => hardRoll ? r.result === 6 : r.result >= 4).length;
  
    let message = `<h2>Psyche Roll</h2>`;
    message += `<p>Successes: <span style="color:${successes > 0 ? 'green' : 'red'}">${successes}</span></p>`;
    message += `<p>Dice Rolled:</p><ul>`;
    roll.dice[0].results.forEach(r => {
      message += `<li>Die: ${r.result} ${r.result === 6 ? '🎲' : ''}</li>`;
    });
    message += `</ul>`;
  
    console.log(`Successes: ${successes}`);
  
    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }

  _onOverflowChange(event) {
    const checkboxes = document.querySelectorAll('.sinOverflow-checkbox');
    const isChecked = event.currentTarget.checked;
    let newValue = 0;
  
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        newValue++;
      }
    });
  
    console.log(isChecked);
    console.log(newValue);
  
    this.actor.update({ 'system.sinOverflow.value': newValue }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }

  _onKitPointsChange(event) {
    const checkboxes = document.querySelectorAll('.kit-points-checkbox');
    const isChecked = event.currentTarget.checked;
    let newValue = 0;

    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        newValue++;
      }
    });

    console.log(isChecked);
    console.log(newValue);
    
    this.actor.update({ 'system.kitPoints.value': newValue }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }

  
  _onDecreaseMarks(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = this.actor.system.talismans || [];
  
    // Change image similar to how the image change function works but in reverse
    const imagePath = talismans[index].imagePath;
    const imageNumber = parseInt(imagePath.match(/-(\d+)\.png$/)[1], 10);
    if (imageNumber > 0 && talismans[index].currMarkAmount >= 0) {
      talismans[index].currMarkAmount--;
      talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${imageNumber - 1}.png`);
    }
  
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }
  
  _onSliderChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = event.currentTarget.value;
    const talismans = this.actor.system.talismans || [];
    talismans[index].currMarkAmount = parseInt(value, 10);
    const imagePath = talismans[index].imagePath;
    talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${value}.png`);
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }
  
  _onAddTalisman(event) {
    event.preventDefault();
    const talismans = this.actor.system.talismans || [];
    talismans.push({
      name: 'test-talisman',
      imagePath: 'systems/cain/assets/Talismans/Talisman-A-0.png',
      currMarkAmount: 0,
      minMarkAmount: 0,
      maxMarkAmount: 6,
    });
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }
  
  _onDeleteTalisman(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = this.actor.system.talismans || [];
    talismans.splice(index, 1);
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }
  
  _onIncreaseMarks(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = this.actor.system.talismans || [];
    if (talismans[index].currMarkAmount < talismans[index].maxMarkAmount) {
      talismans[index].currMarkAmount++;
      this.actor.update({ 'system.talismans': talismans }).then(() => {
        this.render(false); // Re-render the sheet to reflect changes
      });
    }
  }
  
  _onChangeImage(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const newPath = prompt('Enter new image path:');
    if (newPath) {
      const talismans = this.actor.system.talismans || [];
      talismans[index].imagePath = newPath;
      this.actor.update({ 'system.talismans': talismans }).then(() => {
        this.render(false); // Re-render the sheet to reflect changes
      });
    }
  }
  
  _onImageClick(event) {
    const index = event.currentTarget.dataset.index;
    const talismans = this.actor.system.talismans || [];
    if (talismans[index].currMarkAmount < talismans[index].maxMarkAmount) {
      talismans[index].currMarkAmount++;
      const imagePath = talismans[index].imagePath;
      const imageNumber = parseInt(imagePath.match(/-(\d+)\.png$/)[1], 10);
      if (imageNumber < talismans[index].maxMarkAmount) {
        talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${imageNumber + 1}.png`);
      }
      this.actor.update({ 'system.talismans': talismans }).then(() => {
        this.render(false); // Re-render the sheet to reflect changes
      });
    }
  }

  async _rollSinMark(event) {
    event.preventDefault();
    
    // Manually roll 1d6 for the mark
    const TWIST = new foundry.dice.MersenneTwister(Date.now());
    const roll = new Roll('1d6');
    roll.evaluateSync({strict: false});
    let markRoll = Array(roll.dice[0].number).fill(roll.dice[0].faces).reduce((acc, f) => acc + Math.ceil(TWIST.random() * f), roll.total);
    let markIndex = markRoll - 1;
    
    console.log(markRoll);
    console.log(markIndex);
  
    // If rolled a 6, allow the user to choose the mark
    if (markRoll === 6) {
      markIndex = await this._chooseMark();
    }
  
    const sinMarks = this.actor.system.currentSinMarks || [];
    const sinMark = CAIN.sinMarks[markIndex];
  
    // Check if the mark already exists
    const existingMark = sinMarks.find(mark => mark.startsWith(sinMark.name));
    if (existingMark) {
      // Manually roll 1d6 for the ability
      let abilityRoll;
      let newAbility;
      do {
        let abilityRoll = new Roll('1d6');
        abilityRoll.evaluateSync({strict: false});
        abilityRoll = Array(abilityRoll.dice[0].number).fill(abilityRoll.dice[0].faces).reduce((acc, f) => acc + Math.ceil(TWIST.random() * f), abilityRoll.total);
        newAbility = sinMark.abilities[abilityRoll - 1];
      } while (existingMark.includes(newAbility));
  
      // Add the new ability to the existing mark
      sinMarks[sinMarks.indexOf(existingMark)] += `, ${newAbility}`;
    } else {
      // Manually roll 1d6 for the ability
      let abilityRoll = new Roll('1d6');
      abilityRoll.evaluateSync({strict: false});
      abilityRoll = Array(abilityRoll.dice[0].number).fill(abilityRoll.dice[0].faces).reduce((acc, f) => acc + Math.ceil(TWIST.random() * f), abilityRoll.total);
      console.log(sinMark);
      const newAbility = sinMark.abilities[abilityRoll - 1];
  
      // Format the sinMark as "Name - Ability"
      const formattedSinMark = `${sinMark.name} - ${newAbility}`;
  
      // Add the new mark to the sinMarks array
      sinMarks.push(formattedSinMark);
    }
  
    // Update the actor with the new sinMarks array
    this.actor.update({ 'system.currentSinMarks': sinMarks }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }

  async _deleteSinMark(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const sinMarks = this.actor.system.currentSinMarks || [];
    sinMarks.splice(index, 1);
    this.actor.update({ 'system.currentSinMarks': sinMarks }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }

  async _clearSinMarks(event) {
    event.preventDefault();
    this.actor.update({ 'system.currentSinMarks': [] }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }
  
  async _chooseMark() {
    return new Promise((resolve) => {
      const options = CAIN.sinMarks.map((mark, index) => `<option value="${index}">${mark.name}</option>`).join('');
      const content = `
        <form>
          <div class="form-group">
            <label>Choose a Sin Mark:</label>
            <select id="mark-select">${options}</select>
          </div>
        </form>
      `;
  
      new Dialog({
        title: "Choose Sin Mark",
        content: content,
        buttons: {
          choose: {
            label: "Choose",
            callback: (html) => {
              const selectedIndex = parseInt(html.find('#mark-select').val());
              resolve(selectedIndex);
            }
          }
        },
        default: "choose",
        close: () => resolve(0) // Default to the first mark if the dialog is closed
      }).render(true);
    });
  }
  
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = foundry.utils.duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    delete itemData.system['type'];

    return await Item.create(itemData, { parent: this.actor });
  }

  async _onItemDescription(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      ChatMessage.create({
        content: `<h2>${item.name}</h2><p>${item.system.description}</p>`,
        speaker: ChatMessage.getSpeaker({ actor: item.actor })
      });
    }
  }


  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    if (dataset.roll) {
      let label = dataset.label ? ` You rolled for ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());

      console.log(roll);
      roll.roll().then(result => {
        let rollTotal = result.total;
        let message = '';

        result.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `${label} ${message}`,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      });

      return roll;
    }
  }


  _onSinTypeSelect(sinType) {
    const sinTypeMapping = {
      ogre: {
        domains: {
          ability1: { title: "Hostile Door Patterns", value: "The world itself begins to turn against the exorcists. As a complication or a tension move, the ogre supernaturally erases entrances, exits, roads, vehicles, or light sources in an area of about a city block. These return when the scene passes or if the complication is dealt with. Once a hunt, as a tension move, if an exorcist opens any door, the entire group suddenly finds themself in an area of twisting corridors, pitch black darkness, and distant but troubling noises. The area is both dangerous and hostile to them. Finding an exit and escaping will require playing out a scene or two, and the Admin can set out talismans as needed." },
          ability2: { title: "The Unseeing of Things", value: "The miasma becomes permeated with an deep, cloying dark. The ogre is invisible in darkness. It becomes hard to do anything to the ogre unless it is brightly lit or an action doesn’t rely on sight. As a tension move, all electric lights not held by an exorcist sputter out and cease functioning for the next scene. The Admin picks an exorcist and asks them ‘What do you see in the dark?’. They must answer truthfully and gain 1 stress after answering." },
          ability3: { title: "The Grinding of Wheels", value: "The ogre can force exorcists to experience some of the crushing trauma that caused its birth. As a tension move, the ogre can pick an exorcist. That exorcist is afflicted by the Despair affliction. DESPAIR: This special affliction can only affect one exorcist at once. They gain the agenda item push people away even if losing this affliction. At the end of the mission, roll a 1d6. On a 1 or 2, keep this agenda item, on a 3+ may get rid of it. Ask that exorcist the question who in this group will let you down? Any time the chosen person fails an action roll, the afflicted exorcist gains 1 stress. However, if this triggered at least once during a session, at the end of that session also gain 1 xp." },
          ability4: { title: "That Awful Flesh", value: "The ogre can regenerate rapidly from injuries. • It regenerates 1 segment of the execution talisman every time a risk result of 1 is rolled in a conflict scene where it is present. • The ogre takes -1 slash on its execution talisman unless damage by fire, acid, or some other strong chemical or solvent in the same scene." },
          ability5: { title: "The Inevitable Place of Meat", value: "The ogre can temporarily cause the miasma to accelerate its effects. • The touch of the ogre can rapidly rot and decay objects, plant matter, and constructions, destroying them and dissolving them into mud and slime. • Exorcists inside the miasma start to superficially rot if they spend scenes there - hair falling out, sunken skin, dead skin cells, nails falling out, etc. They recover from this damage after the mission. • As a tension move the ogre can cause an exorcist inside the miasma to start decaying. They gain a hook with the Rotting affliction. • Exorcists subtract 1 from all their healing rolls." },
          ability6: { title: "The Lash Calls you Brother", value: "At the start of a mission, the Ogre chooses an exorcist and creates a creature formed from the guilt and shame of that exorcist. The Admin secretly asks the targeted exorcist the following questions: • Which ally are you embarrassed to be around? • What's the worst thing you ever did? • What do you hate the most about yourself? The creature takes a form that plays off these answers. It is a trace with the following execution talisman." },
          ability7: { title: "Where You Belong", value: "The ogre can control mud, water, and ambient temperature to killing effect. The ogre can sink into any sufficiently large pool of mud and reappear in short distance as part of any reaction it takes. As a tension move, the ogre can change the weather in its miasma zone until the exorcists rest, making it extremely hostile (freezing cold, rain, etc). It becomes hard or risky (or both) to perform any activity outside that requires concentration, focus, or manual dexterity without sufficient protection from the weather." },
          ability8: { title: "The Agony", value: "Once a hunt, when pressure increases, the ogre can pick an exorcist. That exorcist gains the Sunken affliction for the rest of the mission." },
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "fortress",
        traumas: "battle scars",
        appearance: "muscular and brutish",
        pressure: "constant need to fight",
        complications: "anger management",
        threats: "uncontrolled rage",
        attackRoll: { lowDamage: "1 stress", mediumDamage: "2 stress", highDamage: "1 stress", rollFormula: "1d6" },
        severeAttack: { description: "devastating blow", rollFormula: "5d6" },
        afflictions: ["berserk", "bloodlust"]
      },
      
      toad: {
        domains: {
          ability1: { title: "Camouflage", value: "camouflage" },
          ability2: { title: "Poison", value: "poison" },
          ability3: { title: "Leap", value: "leap" },
          ability4: { title: "Stealth", value: "stealth" },
          ability5: { title: "Ambush", value: "ambush" },
          ability6: { title: "Swim", value: "swim" },
          ability7: { title: "Regeneration", value: "regeneration" },
          ability8: { title: "Venom", value: "venom" },
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "swamp",
        appearance: "slimy and green",
        traumas: "isolation",
        pressure: "need to hide",
        complications: "trust issues",
        threats: "poisonous touch",
        attackRoll: { lowDamage: "1d3", mediumDamage: "1d5", highDamage: "1d7", rollFormula: "1d5" },
        severeAttack: { description: "venomous strike", rollFormula: "5d6" },
        afflictions: ["toxic", "slippery"]
      }, 
      idol: {
        domains: {
          ability1: { title: "Charm", value: "charm" },
          ability2: { title: "Influence", value: "influence" },
          ability3: { title: "Persuasion", value: "persuasion" },
          ability4: { title: "Seduction", value: "seduction" },
          ability5: { title: "Deception", value: "deception" },
          ability6: { title: "Manipulation", value: "manipulation" },
          ability7: { title: "Charisma", value: "charisma" },
          ability8: { title: "Diplomacy", value: "diplomacy" },
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "temple",
        appearance: "golden and radiant",
        traumas: "betrayal",
        pressure: "need to be loved",
        complications: "narcissism",
        threats: "mind control",
        attackRoll: { lowDamage: "1d2", mediumDamage: "1d4", highDamage: "1d6", rollFormula: "1d4" },
        severeAttack: { description: "hypnotic gaze", rollFormula: "5d6" },
        afflictions: ["charmed", "enslaved"],
      },
      lord: {
        domains: {
          ability1: { title: "Authority", value: "authority" },
          ability2: { title: "Command", value: "command" },
          ability3: { title: "Leadership", value: "leadership" },
          ability4: { title: "Tactics", value: "tactics" },
          ability5: { title: "Strategy", value: "strategy" },
          ability6: { title: "Inspiration", value: "inspiration" },
          ability7: { title: "Intimidation", value: "intimidation" },
          ability8: { title: "Charisma", value: "charisma" },
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "castle",
        appearance: "regal and imposing",
        traumas: "betrayal",
        pressure: "need to rule",
        complications: "tyranny",
        threats: "mind control",
        attackRoll: { lowDamage: "1d3", mediumDamage: "1d5", highDamage: "1d7", rollFormula: "1d5" },
        severeAttack: { description: "devastating blow", rollFormula: "5d6" },
        afflictions: ["charmed", "enslaved"]
      },
      hound: {
        domains: {
          ability1: { title: "Scent", value: "scent" },
          ability2: { title: "Track", value: "track" },
          ability3: { title: "Hunt", value: "hunt" },
          ability4: { title: "Bite", value: "bite" },
          ability5: { title: "Pack", value: "pack" },
          ability6: { title: "Loyal", value: "loyal" },
          ability7: { title: "Ferocity", value: "ferocity" },
          ability8: { title: "Savage", value: "savage" },
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "forest",
        appearance: "furry and feral",
        traumas: "abandonment",
        pressure: "need to belong",
        complications: "pack mentality",
        threats: "rabies",
        attackRoll: { lowDamage: "1d3", mediumDamage: "1d5", highDamage: "1d7", rollFormula: "1d5" },
        severeAttack: { description: "devastating bite", rollFormula: "5d6" },
        afflictions: ["rabid", "feral"]
      },
      centipede: {
        domains: {
          ability1: { title: "Venom", value: "venom" },
          ability2: { title: "Poison", value: "poison" },
          ability3: { title: "Bite", value: "bite" },
          ability4: { title: "Swarm", value: "swarm" },
          ability5: { title: "Crawl", value: "crawl" },
          ability6: { title: "Hide", value: "hide" },
          ability7: { title: "Regeneration", value: "regeneration" },
          ability8: { title: "Venomous", value: "venomous" },
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "cave",
        appearance: "creepy and crawly",
        traumas: "isolation",
        pressure: "need to hide",
        complications: "trust issues",
        threats: "poisonous touch",
        attackRoll: { lowDamage: "1d3", mediumDamage: "1d5", highDamage: "1d7", rollFormula: "1d5" },
        severeAttack: { description: "venomous strike", rollFormula: "5d6" },
        afflictions: ["toxic", "slippery"]
      },
    };

    const sinTypeData = sinTypeMapping[sinType];

    if (sinTypeData) {
      const actor = this.actor;
      actor.update({
        'system.domains': sinTypeData.domains,
        'system.palace': sinTypeData.palace,
        'system.appearance': sinTypeData.appearance,
        'system.traumas': sinTypeData.traumas,
        'system.pressure': sinTypeData.pressure,
        'system.complications': sinTypeData.complications,
        'system.threats': sinTypeData.threats,
        'system.attackRoll': sinTypeData.attackRoll,
        'system.severeAttack': sinTypeData.severeAttack,
        'system.afflictions': sinTypeData.afflictions
      });
    }
  }

}