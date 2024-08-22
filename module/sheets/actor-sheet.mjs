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
    // html.on('click', '.create-agenda-button', this._onItemCreate.bind(this));    
    // html.on('click', '.create-blasphemy-button', this._onItemCreate.bind(this));

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
    // html.on('click', '.roll-button button', this._onRollButtonClick.bind(this));

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
    html.find('.talisman-max-mark').change(this._onMaxMarkAmountChange.bind(this));
    html.find('.roll-rest-dice').click(this._RollRestDice.bind(this));
    html.find('#add-agenda-item-button').on('click', this._addAgendaItemButton.bind(this));
    html.find('#add-agenda-ability-button').on('click', this._addAgendaAbilityButton.bind(this));
    html.find('#editable-agenda-items').on('click', '.remove-item-button', this._removeItemButton.bind(this));
    html.find('#editable-agenda-abilities').on('click', '.remove-ability-button', this._removeAbilityButton.bind(this));
    html.find('#editable-agenda-items').on('change', '.editable-item-input', this._updateAgendaItem.bind(this));
    html.find('#editable-agenda-abilities').on('change', '.editable-ability-input', this._updateAgendaAbility.bind(this));
    /* NPC sheet specific listeners */
    html.find('.attack-button').click(this._onNpcAttack.bind(this));
    html.find('.severe-attack-button').click(this._onNpcSevereAttack.bind(this));
    html.find('.roll-affliction').click(this._onRollAffliction.bind(this));
    html.find('.roll-button').click(this._onRollButtonClick.bind(this));
    html.find('.collapsible-button').click(this._toggleCollapseButton.bind(this));    
    html.find('#sinTypeSelect').change(event => {
      const sinType = event.target.value;
      this._onSinTypeSelect(sinType);
    });

}
  
_addAgendaItemButton(event) {
  event.preventDefault();
  const agendaItems = this.actor.system.currentAgendaItems || [];
  agendaItems.push('New Agenda Item');
  this.actor.update({ 'system.currentAgendaItems': agendaItems }).then(() => {
    this.render(false); // Re-render the sheet to reflect changes
  });
}

_addAgendaAbilityButton(event) {
  event.preventDefault();
  const agendaAbilities = this.actor.system.currentAgendaAbilities || [];
  agendaAbilities.push('New Agenda Ability');
  this.actor.update({ 'system.currentAgendaAbilities': agendaAbilities }).then(() => {
    this.render(false); // Re-render the sheet to reflect changes
  });
}

_removeItemButton(event) {
  event.preventDefault();
  const index = event.target.dataset.index;
  const agendaItems = this.actor.system.currentAgendaItems || [];
  agendaItems.splice(index, 1);
  this.actor.update({ 'system.currentAgendaItems': agendaItems }).then(() => {
    this.render(false); // Re-render the sheet to reflect changes
  });
}

_removeAbilityButton(event) {
  event.preventDefault();
  const index = event.target.dataset.index;
  const agendaAbilities = this.actor.system.currentAgendaAbilities || [];
  agendaAbilities.splice(index, 1);
  this.actor.update({ 'system.currentAgendaAbilities': agendaAbilities }).then(() => {
    this.render(false); // Re-render the sheet to reflect changes
  });
}

_updateAgendaItem(event) {
  const index = event.target.dataset.index;
  const agendaItems = this.actor.system.currentAgendaItems || [];
  agendaItems[index] = event.target.value;
  this.actor.update({ 'system.currentAgendaItems': agendaItems });
}


_toggleCollapseButton(event) {
  const button = event.currentTarget;
  const content = button.nextElementSibling;
  content.classList.toggle('collapsed');
}

_updateAgendaAbility(event) {
  const index = event.target.dataset.index;
  const agendaAbilities = this.actor.system.currentAgendaAbilities || [];
  agendaAbilities[index] = event.target.value;
  this.actor.update({ 'system.currentAgendaAbilities': agendaAbilities });
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
    const baseDice = this.actor.system.skills[skill].value;
    let totalDice = baseDice + extraDice + (teamwork ? 1 : 0) + (setup ? 1 : 0);
  
    if (useDivineAgony) {
      const divineAgonyStat = this.actor.system.divineAgony.value; // Replace with the actual path to the divine agony stat
      totalDice += divineAgonyStat;
      this.actor.update({ 'system.divineAgony.value': 0 }); // Set divine agony to zero
    }
    
    let roll;
    if (totalDice > 0) {
      roll = new Roll(`${totalDice}d6`);
    } else {
      roll = new Roll(`2d6`);
    }
    await roll.evaluate({ async: true });
    
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

  async _RollRestDice(event) {
    event.preventDefault();
  
    // Get the rest dice modifier from the input field
    const restDiceModifier = parseInt(this.actor.system.restDiceModifier, 10) || 0;
  
    // Calculate the number of dice to roll
    const baseDice = 2;
    const totalDice = baseDice + restDiceModifier;
    const rollFormula = `${totalDice}d3`;
  
    // Roll the dice using Foundry's built-in dice roller
    const roll = new Roll(rollFormula);
    await roll.evaluate({ async: true });
  
    // Get individual dice results
    const diceResults = roll.terms[0].results.map(result => result.result).join(', ');
  
    // Display the result in the chat with the rules for rest dice
    const restDiceRules = `
      <h2>Rest Dice Rules</h2>
      <p>Exorcists that rest are recovering and letting time pass. The exorcists must decide to rest as a group. If they do, pressure always increases by 1.</p>
      <p>Each exorcist rolls 2d3, then takes each die and assigns it to an item from the following list. They are able to make the same choice twice:</p>
      <ul>
        <li>Regain that many psyche bursts</li>
        <li>Recover stress equal to the d3</li>
        <li>Erase slashes on a hook equal to the d3</li>
      </ul>
      <p>Resting also ends the effects of some powers and abilities, or resets others.</p>
    `;
  
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Rolling Rest Dice: ${rollFormula}<br>Dice Results: ${diceResults}<br>${restDiceRules}`
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
      maxMarkAmount: 13,
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

  _onMaxMarkAmountChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = parseInt(event.currentTarget.value, 10);
    const talismans = this.actor.system.talismans || [];
  
    // Ensure the max mark amount is between 0 and 13
    const newMaxMarkAmount = Math.max(0, Math.min(13, value));
    talismans[index].maxMarkAmount = newMaxMarkAmount;
  
    // Adjust currMarkAmount if it exceeds the new maxMarkAmount
    if (talismans[index].currMarkAmount > newMaxMarkAmount) {
      talismans[index].currMarkAmount = newMaxMarkAmount;
      const imagePath = talismans[index].imagePath;
      talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${newMaxMarkAmount}.png`);
    }
  
    this.actor.update({ 'system.talismans': talismans }).then(() => {
      this.render(false); // Re-render the sheet to reflect changes
    });
  }



  async _rollSinMark(event) {
    event.preventDefault();
    
    // Manually roll 1d6 for the mark
    const roll = await new Roll('1d6').roll({async: true});
    let markRoll = roll.total;
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
      let newAbility;
      do {
        const abilityRoll = await new Roll('1d6').roll({async: true});
        newAbility = sinMark.abilities[abilityRoll.total - 1];
      } while (existingMark.includes(newAbility));
  
      // Add the new ability to the existing mark
      sinMarks[sinMarks.indexOf(existingMark)] += `, ${newAbility}`;
    } else {
      // Manually roll 1d6 for the ability
      const abilityRoll = await new Roll('1d6').roll({async: true});
      const newAbility = sinMark.abilities[abilityRoll.total - 1];
      console.log(sinMark);
  
      // Format the sinMark as "Name - Ability"
      const formattedSinMark = `${sinMark.name} - ${newAbility}`;
  
      // Add the new mark to the sinMarks array
      sinMarks.push(formattedSinMark);
    }
  
    // Update the actor with the new sinMarks array
    await this.actor.update({ 'system.currentSinMarks': sinMarks });
    this.render(false); // Re-render the sheet to reflect changes
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

// Assuming this is part of the ActorSheet class

  async _onNpcAttack(event) {
    event.preventDefault();
    const roll = await new Roll('1d6').roll({ async: true });
    const lowDamage = this.actor.system.attackRoll.lowDamage;
    const mediumDamage = this.actor.system.attackRoll.mediumDamage;
    const highDamage = this.actor.system.attackRoll.highDamage;

    let damageMessage;
    if (roll.total >= 4) {
      damageMessage = `<span style="color: green;">Low Damage: ${lowDamage}</span>`;
    } else if (roll.total >= 2) {
      damageMessage = `<span style="color: orange;">Medium Damage: ${mediumDamage}</span>`;
    } else {
      damageMessage = `<span style="color: red;">High Damage: ${highDamage}</span>`;
    }

    const message = `
      <div style="border: 1px solid #444; padding: 10px; border-radius: 4px; background-color: #1a1a1a; color: #f5f5f5;">
        <h2 style="margin: 0 0 10px 0;">Attack Roll</h2>
        <p><strong>Roll:</strong> <span style="font-size: 1.2em;">${roll.total}</span></p>
        <p>${damageMessage}</p>
      </div>
    `;
    ChatMessage.create({ content: message });
  }

  async _onNpcSevereAttack(event) {
    event.preventDefault();
    const description = this.actor.system.severeAttack.description;
    const rollFormula = this.actor.system.severeAttack.rollFormula;
    const dialogContent = `
      <div style="padding: 10px; background-color: #2c2c2c; border-radius: 8px; color: #f5f5f5;">
        <p style="font-size: 1.2em; margin-bottom: 10px;">${description}</p>
        <div style="margin-bottom: 10px;">
          <label for="dice-modifier" style="display: block; margin-bottom: 5px; font-weight: bold;">Dice Modifier:</label>
          <input type="number" id="dice-modifier" name="dice-modifier" value="0" style="width: 100%; padding: 5px; border-radius: 4px; border: 1px solid #444; background-color: #1a1a1a; color: #f5f5f5;">
        </div>
      </div>
    `;
    new Dialog({
      title: "Severe Attack",
      content: dialogContent,
      buttons: {
        roll: {
          icon: "<i class='fas fa-dice'></i>",
          label: "Roll",
          callback: () => {
            const modifier = parseInt(document.getElementById('dice-modifier').value) || 0;
            this._performSevereAttackRoll(rollFormula, modifier);
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
  
  async _performSevereAttackRoll(rollFormula, modifier) {
    // Extract the number of dice from the roll formula
    const match = rollFormula.match(/(\d+)d6/);
    if (!match) {
      console.error("Invalid roll formula");
      return;
    }
  
    const baseDice = parseInt(match[1]);
    const totalDice = Math.max(baseDice + modifier, 0); // Ensure totalDice is not below 0
  
    const roll = new Roll(`${totalDice}d6`);
    await roll.evaluate({ async: true });
  
    let onesCount = 0;
    let nonOnesCount = 0;
  
    let message = `<h2>Severe Attack Roll</h2>`;
    message += `<p>Dice Rolled:</p><ul>`;
    roll.dice[0].results.forEach(r => {
      if (r.result === 1) {
        onesCount++;
        message += `<li>Die: ${r.result} 😈👿</li>`;
      } else {
        nonOnesCount++;
        message += `<li>Die: ${r.result}</li>`;
      }
    });
    message += `</ul>`;
    message += `<p>Number of 1's: ${onesCount}</p>`;
    message += `<p>Number of non-1's: ${nonOnesCount}</p>`;
  
    ChatMessage.create({
      content: message,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }


  async _onRollAffliction(event) {
    event.preventDefault();
    const roll = await new Roll('1d6').roll({ async: true });
    const afflictions = this.actor.system.afflictions;
    const affliction = afflictions[roll.total - 1]; // Assuming afflictions is an array
    const message = `
      <div style="border: 1px solid #444; padding: 10px; border-radius: 4px; background-color: #1a1a1a; color: #f5f5f5;">
        <h2 style="margin: 0 0 10px 0;">Affliction Roll</h2>
        <p><strong>Roll:</strong> <span style="font-size: 1.2em;">${roll.total}</span></p>
        <p><strong>Affliction:</strong> ${affliction}</p>
      </div>
    `;
    ChatMessage.create({ content: message });
  }

  _onSinTypeSelect(sinType) {
    const sinTypeMapping = {
      ogre: {
        domains: {
          ability1: {
            title: "Hostile Door Patterns",
            value: "The world itself begins to turn against the exorcists. As a complication or a tension move, the ogre supernaturally erases entrances, exits, roads, vehicles, or light sources in an area of about a city block. These return when the scene passes or if the complication is dealt with. Once a hunt, as a tension move, if an exorcist opens any door, the entire group suddenly finds themself in an area of twisting corridors, pitch black darkness, and distant but troubling noises. The area is both dangerous and hostile to them. Finding an exit and escaping will require playing out a scene or two, and the Admin can set out talismans as needed."
          },
          ability2: {
            title: "The Unseeing of Things",
            value: "The miasma becomes permeated with an deep, cloying dark. The ogre is invisible in darkness. It becomes hard to do anything to the ogre unless it is brightly lit or an action doesn’t rely on sight. As a tension move, all electric lights not held by an exorcist sputter out and cease functioning for the next scene. The Admin picks an exorcist and asks them ‘What do you see in the dark?’. They must answer truthfully and gain 1 stress after answering."
          },
          ability3: {
            title: "The Grinding of Wheels",
            value: "The ogre can force exorcists to experience some of the crushing trauma that caused its birth. As a tension move, the ogre can pick an exorcist. That exorcist is afflicted by the Despair affliction. DESPAIR: This special affliction can only affect one exorcist at once. They gain the agenda item push people away even if losing this affliction. At the end of the mission, roll a 1d6. On a 1 or 2, keep this agenda item, on a 3+ may get rid of it. Ask that exorcist the question who in this group will let you down? Any time the chosen person fails an action roll, the afflicted exorcist gains 1 stress. However, if this triggered at least once during a session, at the end of that session also gain 1 xp."
          },
          ability4: {
            title: "That Awful Flesh",
            value: "The ogre can regenerate rapidly from injuries. • It regenerates 1 segment of the execution talisman every time a risk result of 1 is rolled in a conflict scene where it is present. • The ogre takes -1 slash on its execution talisman unless damage by fire, acid, or some other strong chemical or solvent in the same scene."
          },
          ability5: {
            title: "The Inevitable Place of Meat",
            value: "The ogre can temporarily cause the miasma to accelerate its effects. • The touch of the ogre can rapidly rot and decay objects, plant matter, and constructions, destroying them and dissolving them into mud and slime. • Exorcists inside the miasma start to superficially rot if they spend scenes there - hair falling out, sunken skin, dead skin cells, nails falling out, etc. They recover from this damage after the mission. • As a tension move the ogre can cause an exorcist inside the miasma to start decaying. They gain a hook with the Rotting affliction. • Exorcists subtract 1 from all their healing rolls."
          },
          ability6: {
            title: "The Lash Calls you Brother",
            value: "At the start of a mission, the Ogre chooses an exorcist and creates a creature formed from the guilt and shame of that exorcist. The Admin secretly asks the targeted exorcist the following questions: • Which ally are you embarrassed to be around? • What's the worst thing you ever did? • What do you hate the most about yourself? The creature takes a form that plays off these answers. It is a trace with the following execution talisman."
          },
          ability7: {
            title: "Where You Belong",
            value: "The ogre can control mud, water, and ambient temperature to killing effect. The ogre can sink into any sufficiently large pool of mud and reappear in short distance as part of any reaction it takes. As a tension move, the ogre can change the weather in its miasma zone until the exorcists rest, making it extremely hostile (freezing cold, rain, etc). It becomes hard or risky (or both) to perform any activity outside that requires concentration, focus, or manual dexterity without sufficient protection from the weather."
          },
          ability8: {
            title: "The Agony",
            value: "Once a hunt, when pressure increases, the ogre can pick an exorcist. That exorcist gains the Sunken affliction for the rest of the mission."
          }
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: ""
        },
        palace: "Tracking an ogre down is often a matter of finding its host, or where its host is currently residing. Once influenced by an ogre, a host usually withdraws from society and cuts off its connections, making this harder than it would usually be. An ogre’s palace typically resembles a mirror of a space significant to the ogre’s host, but long decayed and significantly expanded in size into a warren or maze-like space. Interspersed in the area is garbage, junk, and things the ogre has collected. The ogre typically barely fits inside and may have to painfully squeeze or crouch to move around, although this doesn’t seem to slow it down at all. Typical palaces resemble: • Abandoned or derelict buildings • Filthy high rise apartments • Closed or shuttered schools • Empty, dead workplaces or offices Ogre palaces are: Dark/Wet/Cold/Musty/ Reeking/Filthy",
        traumas: "• Who or what pushed you into this hole? • Who or what is keeping you from going over the edge? • What are you most ashamed of?",
        appearance: "Ogres are almost always extremely large, strong, and bulky and manifest a typical malformed, monstrous appearance, often due to the low self worth of their hosts. When fused with a host, the host may appear to be a worse, ‘uglier’ version, as they judge themselves. An ogre’s mere presence sucks the energy and life out of a room, even if mundane humans cannot see it, lowering the temperature. They are associated with frost, mist, mud, and ill weather. When pressed in a fight they are enormously strong and durable, able to rapidly regenerate from their wounds, tear a human in half, and ignore even extreme punishment.",
        pressure: "The very presence of an ogre begins to infect an area with a dark Miasma . When an ogre appears, the weather will typically sour in the local area over the next few days and remain that way until the ogre reaches critical mass and undergoes a sin event or is executed. This miasma typically manifests the following way: • buildings, objects, roads, and other constructions in the area begin to degrade as though they have suffered from poor maintenance for years • clouds shroud the sun and fog rolls in. Over time, the fog becomes thicker and thicker and eventually acquires a sour smell • a thick white mold begins to grow over surfaces • technology, phone lines, electricity, and internet stop working reliably, and eventually stops working all together • architecture stops conforming to sense and becomes maze-like or nonsensical • Humans spending time inside the miasmatic area begin to share in the ogre’s outlook and become more and more hostile When the exorcists arrive, the miasma should cover only part of the area the exorcists are trying to investigate, like a few blocks. Each time pressure increases, the miasma spreads to a new area. When pressure fills up completely, the situation gets out of control. T he Ogre increases in CAT by +1, and the miasma covers the entire area of the investigation - no matter where the exorcists go, the miasma follows them for the duration of the mission - even if they leave the investigation area.",
        complications: "Kill lights, summon mist, spew ceaselessly on someone, bury an exorcist in mud, slime, or vomit, pin down an exorcist, release acrid stench, smash walls, floor, or ceilings, retreat into darkness, add a bystander, use a domain.",
        threats: "Grab an exorcist and squeeze the life out of them. Hurl exorcist through a wall. Collapse architecture. Summon minions. Kill bystanders. Infect with dark pulsing veins. Cause a flash flood or freeze. Blind someone in a miasmatic cloud. Use a domain. Do something dark, crushing, or vile.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        }, 
        severeAttack: {
          description: "An ogre can use this ability on a ‘1’ on the risk roll, striking out with overwhelming and crushing force: a flurry of limbs, a torrent of darkness, an elephant-like foot, a cavernous jaw. They can only use it once a mission. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate. Start with a pool of 5d6. Then remove one dice for each of the following. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act. • Is another person aiding you? They can describe how. • Can you grab on to something nearby? • Do you have a source of bright light or heat? • Is the ogre distracted, hindered, or under duress in some way? • Then roll the dice. The exorcist and any aiding them take 1 stress for every die rolled, no matter the result. If at least one ‘1’ comes up, the targeted exorcist immediately takes an injury and the mangled limbs affliction: all physical activity is hard unless set up by an ally or participating in teamwork. If two or more ‘1’s come up, the exorcist has one or more of their limbs torn off (roll 1d3: 1: arm 2: leg 3: both legs). Roll 1d6 for left or right (left on 1-3, right on 4-6). They take an injury, pass out until the scene passes, then all physical activity is hard for them without teamwork. After the mission is over, they can adjust to their disability and this no longer has an effect on them (determine with Admin how your character heals).",
          rollFormula: "5d6"
        },
        afflictions: ["White Mold: Spreading white veins and coughing indicate mold infection. Subtract 1 from all resting rolls while afflicted and cannot eat, drink, or use consumables.", "Frozen Limbs: Physical activity or fine motor skill is hard if it requires more than one limb.", "Circling the Drain : Cannot benefit from teamwork or setup. Permanently add to your agenda: give up on something.", "Speaking spews out black sludge. All communication that requires speaking is hard", "Rotting: Black rot has taken in the body. Take 1 stress each time pressure fills up. If this inflicts an injury, it inflicts instant death.", "Permanently add to your agenda: die."]
      },
      toad: {
        domains: {
          ability1: {
            title: "Hotel for One",
            value: "The toad is able to use its powerful lungs to suck people into its maw, where they are shunted into a tiny prison-space inside its gullet. As a complication the Toad can suck in an exorcist it is fighting. That exorcist is trapped inside a tiny cage-like extra-dimensional room inside the toad and takes 1 stress before acting while imprisoned until they can escape or their allies can help them escape (set out a talisman for the complication as normal). They are vomited out when they are able to break out of their cage. As a tension move, the Toad can kidnap any NPC the exorcists have met off-screen and imprison them in its oubliette, mostly unharmed. Freeing them requires fighting the Toad and may take a talisman."
          },
          ability2: {
            title: "Greasing the Palms",
            value: "A vile alchemy churns in the toad’s gut. As a complication or threat , the toad is able to vomit up a thick, nauseating slime that reeks of expensive perfume. It can be incredibly sticky, incredibly slippery (the toad chooses), and carpets the area of about a large room. • Actions that require concentration, quick movement, or manual dexterity become hard in the area. • It becomes incredibly hard to keep your footing in the area. Any action that requires moving around by the exorcists rolls two risk dice and picks the lowest."
          },
          ability3: {
            title: "The Granting of Gifts",
            value: "The toad is an especially powerful hoarder, and keeps quantitites of strange items to regurgitate in an emergency. As a reaction (1-3), the Toad can forcibly regurgitate items from its gullet. This can inflict stress, cause a threat or cause a complication as normal. However, roll randomly for the category of item it produces, which may affect the outcome: 1. Vehicle, drivable. 2. Explosives 3. Weapons, ammunition 4. Narcotics 5. Material wealth (gold bars, jewels, etc) 6. Alcohol (in liquid or bottle form) Then roll randomly for the size or volume (1d3). Adjust stress suffered by the amount shown if dealing stress. 1. Comically smaller than expected (-1 stress) 2. Expected 3. Unbelievably larger than expected (+1 stress)"
          },
          ability4: {
            title: "Wolf Down the Earth",
            value: "The Toad is able to unhinge its jaw to a void-like space and swallow huge chunks of the scenery. • It can burrow through solid rock when moving around. • The toad inflicts +1 more stress to its target if it is slowed, off balance, immobile, or entangled in some way. • Once a scene, as a threat, it can attempt to devour an area close to it, obliterating all inanimate matter, no matter its toughness. The size of this area depends on the Toad’s CAT. One or two exorcists caught in the area take 2d3 stress if the toad is allowed to execute on the threat."
          },
          ability5: {
            title: "Sticky Fingers",
            value: "The Toad is artful at lifting items from the exorcists. When an exorcist takes stress from the Toad, they also (the Toad chooses 1): • tick 1 KP. If they don’t have KP to spend, they take +1 more stress • lose a piece of gear instead of taking stress. The KP of the item must equal the stress suffered or less"
          },
          ability6: {
            title: "The Artful Dodger",
            value: "The Toad is especially careful and crafty, setting up contingency plans. Three times a hunt, when the exorcists take action, the Admin can narrate a flashback of the Toad setting up a contingency plan, fallback, or trap that it is able to spring. Roll a 3d6 fortune roll. For every 3+, the toad may either inflict 1 stress on the exorcist triggering this domain or reduce any stress suffered from the triggering action by 1."
          },
          ability7: {
            title: "Keeper of the Ludic Menagerie",
            value: "he Toad stores brainwashed humans inside its gullet, and pulls them out as needed. Humans stored this way are freed when the toad is defeated and have no memory of the incident. • The Toad can pull out a human to perform any mundane servile task for it, such as cooking, cleaning, driving, etc. They are completely obedient to the toad and always come out with something convenient to the current situation, such as a guard with a door key, a taxi driver, etc. • It can pull out a goon as a (1-3) r eaction in a conflict scene. This creates a toadspawn trace with an execution talisman of 1, or adds +1 to an existing trace’s execution talisman. • As a threat in any conflict scene, the toad can kidnap a mundane human or NPC present, brainwashing them and adding to its collection."
          },
          ability8: {
            title: "The Great Glittering Adversary",
            value: "The Toad is able to transform matter into material wealth, such as precious gemstones or gold. By touching any surface or living matter, it can transform it into gemstone or gold. It can use this as a threat or complication to inflict stress, block the exorcists, or inflict the below affliction. 138 139 Midan Touch: Inflict this on the exorcists with a threat or a hook. The skin of an arm or leg of the afflicted exorcist slowly becomes turning into gemstone or rock, usually starting from the contact area. Actions that require speed or dexterity from them become hard. When the exorcists finish a rest, they take 3 stress. If this stress would inflict an injury, they instead suffer instant death and turn into a jeweled statue."
          }
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "A toad’s palace represents a monument to wealth, often as envisioned by its host. On the outside it may be located inside a cramped building or in a tiny apartment block, but on the inside it is typically an opulent, sprawling extravaganza. Toad palaces typically take the form of summer mansions, luxury residences, resorts, casinos, or other places that mix pleasure and commerce. The host may reside at least part time inside the palace due to its space and comfort. Over time the space becomes crammed almost to bursting with the wealth that the toad accumulates, transforming partly into treasure vaults or galleries to either protect or display their largesse. Toad palaces are typically: Opulent, gaudy, glitzy, spacious, extravagant, luxurious, comfortable",
        appearance: "Toads are bulky but surprisingly fast sins with a great degree of manual dexterity. They often have prehensile tongues or double jointed limbs, and convey these features onto any hosts they are fused with. They are capable of squeezing through tiny spaces and leaping great distances. The gaping mouths of toads have space extending properties and are capable of storing an unreal amount of physical material - many rooms worth in some cases. All toads have a strong, not entirely unpleasant odor about them - something between carpet cleaner and expensive cologne. Behavior: Unlike other sins, who typically want to",
        traumas: "• What do you deserve that was denied to you? • While you were starving, who was feasting? • Where do you draw the line?",
        pressure: "A toad’s main driving desire is to acquire as much material wealth as possible for its host. It steals as much as it can, by various means, based on its host’s desires, storing its prizes inside of its expansive gullet and regurgitating them later inside its palace. A toad’s larceny can start small, but as time goes on its appetites, both literal and figurative, become more expansive. A host that wanted a faster car in the past, for example, will eventually draw a toad to find the fastest car in town and swallow it, then the next fastest car too, and so on. As time goes on, the amount of material the toad swallows and its avarice inevitably starts to grow out of control, to unreal proportions. Instead of stealing food for its host, for example, it may swallow an entire restaurant, staff and all. In theory a high enough category toad would swallow an entire town, given time. The toad gains power from its hoard. Every time pressure increases, its greed increases too, describing the kind of things it can steal: • 0-2: High worth but mundane items. Money, cars, guns, medicine, food, fashion, high art. • 3-4: Unreal amounts of the above. • 5+: Entire stores, shops, restaurants, yachts, buses, celebrities. At 6+, the toad’s CAT increase by 1 and it gains the ability to steal conceptual or intangible items like abstract wealth, stocks in a company, light, artistic skill, or happiness.",
        complications: "Leap out of reach on muscular legs or squeeze into a tight space. Entangle in traps. Reveal hidden explosives. Trigger security, or alarms. Vomit slime or disgorge stomach contents. Add a bystander, use a domain.",
        threats: "Summon bodyguards. Steal something from the exorcists, collapse or throw something from the environment. Set off a bomb. Kick someone with powerful legs. Swallow something or someone whole. Inflict a hook. Use a domain. Do something crafty, flashy, or shocking.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        },         
        severeAttack: { description: "The Sin can use this ability on a ‘1’ on the risk roll. They can only use it once a mission. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate. Start with a pool of 5d6. Then remove one dice for each of the following. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act, suffering consequences as normal if they fail. • Are you accepting of your powers? • Are your allies close enough to touch you skin to skin? • Are you willing to part with your kit? If you answer yes to this, the Toad is distracted by stealing every item of gear from you you currently have ticked. They disappear until the Toad is defeated. Is the Toad hindered, distracted, or under duress in some way? Then roll the dice. The exorcist and any aiding them take 1 stress for every die rolled, no matter the result. • If at least one ‘1’ comes up, the Toad steals the ability to use psychic powers from the targeted exorcist. These coalesce into a psychic shadow, which runs off. It is a sin with an execution talisman of 3 and it uses reactions to attempt to flee. If it is destroyed, captured, or the scene ends, it fuses with its host again, ending this effect. • If two or more ‘1’s come up, the execution talisman of the shadow is 5 instead.", rollFormula: "5d6" },
        afflictions: ["Absent Minded: Whenever you roll a ‘1’ on risk, erase 1 KP.", "Wasting Sickness: Reduce max stress by 1 each time you rest. If reduced to 0, you suffer instant death.", "Starvation: All actions are hard until you or an ally mark 1 KP and allow you to eat something. This effect resets and you must eat again after you rest.", "Itchy Fingers: Once a scene, stealing something (anything) gives you 1 psyche burst and 1d3 sin. Permanently add to your agenda: steal.", "Dreaming Desire: When pressure increases, spend 1 psyche burst to daydream about things you want or take 2 stress.", "The Want: Permanently add to your agenda: take more than you need. Or improvise: make a something hard or"]
      }, 
      idol: {
        domains: {
          ability1: { title: "Toys for Men", value: "The idol gains the ability to play with the flesh of others like marionettes. Cultists gain +1 segment on their execution talisman (so a lone cultist would have 3) as they can keep moving even while their body is broken, jerked by invisible strings. The idol gains a new affliction: COLLECT DOLL: When afflicted, the exorcist loses control of one of their arms. It becomes doll-like in texture and appearance. Once a scene, the idol can interfere with an action the exorcist is performing as the hand interferes, forcing them to either take 1 stress or make the action hard." },
          ability2: { title: "Elevation of the Innumerable Mass", value: "The idol gains the ability to elevate members of its cult into minor sins. One of these can appear a scene when fighting the idol or its cult. Apostle (Sin). Execution talisman 4. Armed with supernatural strength and mutated blades. Reactions: Inflict stress. Attacks with: Mutated body, mundane firearms or blades. (1) 3 stress, (2/3): 2 stress, (4+): 1 stress. Or: create a complication or threat: Create a fleshy clone of itself, unleash a flurry of attacks, mutate further, move impossibly fast. Or: Exort (1-3): An ally of the apostle heals slashes on their execution clock depending on the risk die (1: 2 ticks, 2-3: 1 tick). The next time that ally inflicts stress on an exorcist, they inflict +1 stress." },
          ability3: { title: "Hold My Darlings", value: "The idol cultivates a special, insidious bond to its cult members. • Once a scene, when the idol would take slashes on its execution talisman from an exorcist’s action, it can supernaturally transfer the harm to any cultist or group of cultists present in the scene instead. This includes any NPCs added to the idol’s cult. • The idol can see through the eyes of any cult member as if they were its own, and can speak through the mouths of cult members with its voice." },
          ability4: { title: "That Pliable Flesh", value: "The idol can twist its form rapidly and shape shift. • As a tension move, reveal in a scene at any point that someone the exorcists are talking to is actually the idol. All exorcists that witness this take 1 stress. This can force a conversation or a conflict scene. • As a complication in a conflict scene, the idol can rapidly shape shift into an exact copy of one of the exorcists. Until the complication is dealt with, when the idol would take slashes on its execution talisman, roll a d6. On a 1-2, reduce the slashes to 0 and the doubled exorcist takes 2 stress as it becomes impossible to distinguish between the two." },
          ability5: { title: "Slumbering, I Saw a Shape in the Door", value: "The idol can enter the minds of the exorcists when they let their guard down. • When the exorcists rest, each makes a 1d6 fortune roll. On a 1, they immediately gain an idol affliction. • Once a hunt, as a tension move, the idol may immediately force the exorcists to rest for the next scene. This doesn’t tick tension, cannot progress pressure past 4, and the results of all their resting rolls are ‘1’ no matter what. During their rest they have disturbing daydreams. One exorcist may describe these to the group." },
          ability6: {
            title: "Taking the Ears",
            value: "The idol’s voice and psychic presence is overwhelming, like an ocean battering down a rickety door. • As a threat or a tension move, the Idol can speak to a group of mundane humans. If successful, they are immediately added to the cult and become a group of cultists. If cultists are already present, increase their execution talisman by 2 instead. • As a threat, the idol can begin to speak an unspeakable word. If the threat is successful, one exorcist that hears it takes 2 stress and the deafened affliction for the rest of the mission (can’t hear, may make activities reliant on hearing hard or impossible). Characters that are already deaf are immune to this. At the end of the mission, roll a 1d6 fortune. On a 1 or 2, the character is permanently deafened but has time to adjust before the next mission, making it have no further deleterious effects."
          },
          ability7: { title: "The Glory", value: "The idol is capable of taking a form that overwhelms the senses. • Once a scene, the Idol can take a glorious form as a complication. Non-cultist humans witnessing the form instantly become unconscious. Exorcists witnessing the form can either take 1 stress when acting against the idol and ignore it, or avert their gaze. If they avert their gaze, it becomes hard to do anything that relies on sight. • Cultists present in the scene are motivated by the idol and may re-roll the risk die when acting, taking the second result as final. • One exorcist sees this form as someone dear to them and must describe who to the group. They take 1 stress when harming the idol while the form is active. • This complication can be dealt with as normal." },
          ability8: {
            title: "The Strong Scented Lips of a Whispering God",
            value: "The idol has major connections with the human world: fans, businessmen, or politicians. This presents an expanding problem for CAIN cleanup. Cultists are now armed with short ranged firearms and body armor, dealing +1 stress with reactions. Increase their execution talisman by +1. • Set out an exposure talisman, of 10 length. Whenever the exorcists engage in a conflict scene, tick it up by 1d3. If the exorcists do something else loud, violent, or with high exposure, tick it up by 1, but no more than once a scene. • If the talisman is 3 or more, local authorities will start to attempt to arrest the exorcists. If it’s 6 or more, the response becomes more severe in scale. Exorcists can attempt to untick this talisman with their actions. If the talisman fills up before the idol is dealt with, cleanup becomes catastrophic as the news spreads beyond CAIN control. The exorcists will receive no scrip pa y for the mission."
          }
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "Idols tend to manifest their palace where their cult is located, typically in populated locations. They may have a front operation that covers the entrance to their palace and their cult in general - a news or internet program, a band, a concert hall, a religious gathering, etc. The true headquarters of their cult is typically more concealed and harder to access. At the center is usually an entrance to their palace, which the idol may invite select cult members in to visit in order to win them over. Depending on the aspiration of the sin, the interior of typical palaces is usually a monument to self-obsession and resembles: • Palatial estates • Nightclubs or concert halls • Beautiful high rise penthouse apartments • Religious halls or places of worship Idol palaces are typically: Luxurious, gilded, airy, captivating, impressive, gaudy, holy",
        appearance: "Idols commonly appear as humanlike in form. They may appear as someone desired by their host: their hosts’ ideal romantic partner, a parental figure, or a best friend. When fused with their hosts, they may enhance their hosts into ‘ideal’, more perfect versions of themselves, usually enhancing features a host deems desirable, and eliminating those seen as undesirable. They have a godly, otherworldly beauty to them that can be stunning to humans, especially the graceless. When forced into a corner, or when they want to display their power, idols are capable of taking other, more terrible forms.",
        traumas: "• What is your dream? • Why did you give up on your dream? • Why do you think you are you incapable of being loved?",
        pressure: "dols gather cults around them, adding steadily to them over time. This varies from mundane admirers of the idol to people totally pulled under their spell. A lower category idol tends to pull people into a cult of a few dozen people, whereas a higher category one can pull in a cult that numbers in the hundreds or thousands. While the idol still lives, cultists are completely and unflinchingly loyal to them and their host , and will follow the commands and inclinations of their higher-ups in the cult without questioning. The idol is able to secretly add npcs to its cult. Every time pressure increases, the Admin chooses an NPC the players have met on the mission and adds them to the cult. They don’t have to reveal to this to the players.",
        complications: "Rile up a crowd, enthrall someone, blind with glory, overwhelm with emotion, force out secrets, disarm someone, spew out hallucinations, add a bystander, use a domain.",
        threats: "Summon cultists. Cause crippling pain. Overwhelm the senses. Force exorcists to sarifice something. Expose a weakness. Enthrall an exorcist. Take captives. Inflict a hook. Use a domain. Do something emotionally crushing, manipulative, or shocking.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        }, 
        severeAttack: {
        description: "An idol can use this ability on a ‘1’ on the risk roll. They can only use it once a mission. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate. Start with a pool of 5d6. Then remove one dice for each of the following questions you answer ‘yes’ to. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act, suffering consequences as normal if they fail. • Are you far from the idol? • Do you have love in your life? • Does someone aiding you care about you? They can describe how. • Is the idol hindered, distracted, or under duress in some way? Then roll the dice. The exorcist and any aiding them take 1 stress for every die rolled, no matter the result. • If at least one ‘1’ comes up, the targeted exorcist must answer the question: Who in among their allies do they desire the most? This answer could be platonic, and the idol may give them a chance to reconsider. • If the answer is ‘nobody’ or ‘myself’, the idol instantly inflicts an injury and knocks the targeted exorcist unconscious for the remainder of the scene. If the answer is another ally, the idol forcibly fuses the flesh of the two together. This has no immediate adverse effects, but the two victims can only act with teamwork with each other while fused. After the exorcists rest, they can remain fused or forcibly separate themselves. This inflicts an injury on each of them. It otherwise ends after the hunt as CAIN is able to safely separate them. • If two or more ‘1’s come up, this effect instead lasts until the rest of the hunt, and can’t be ended early. • After two fused exorcists are un-fused (whichever way), they each take an agenda item from the other’s agenda as a bold item.",
        rollFormula: "5d6"
       },
       afflictions: [
        "Infatuated: Pick an ally. If you act without their setup or teamwork, you take 1 stress.",
        "Solipsism: Take 2 stress if participating in teamwork or setup.",
        "Violet Somnia: You can roll a resting die any time. However, if you do, you fall asleep until pressure increases and can’t be woken.",
        "Violent Jealousy: Pick an ally. Gain 1 stress if they roll any ‘6’. Permanently add to your agenda: let nobody else outshine you.",
        "Narcissi: Powers that target only yourself gain +1 CAT. Powers that target at least one ally get -1 CAT.",
        "The Want: Permanently add to your agenda: show someone you are worthy of their attention"
      ]
      },
      lord: {
        domains: {
          ability1: { title: "Stricture of Manifestation", value: "The Lord or its host gain increased control over reality inside its Kingdom, granting them the following powers. It can use these as threats or complications: • Cause any object up to the size of a small building to coalesce and appear in a few moments. • Invert or choose the direction and strength of gravity, or even make space curved • Change the weather or change the biome of an area, such as from sunny to snowy • Rearrange the interiors and layouts of buildings, streets, or corridors In addition, as a threat or a tension move, the Lord can dismiss any psychic power caused by the exorcists that has a sustained effect (like a summon or curse). This only works inside the kingdom." },
          ability2: { title: "Stricture of Superiority", value: "The Lord fights more fiercely the less exorcists play by the rules of the Kingdom. At the start of the round in a conflict scene, the Lord can take one of the following stances. Exorcists that don’t fulfill the requirements are punished. It must switch to a different stance each round. • Honorable Fighting: Exorcists that participate in teamwork or setup take 1 stress. • Grand Melee: Exorcists acting without benefiting from teamwork or setup find it hard. • Duel: The Lord chooses an exorcist. That exorcist deals +2 more slashes on the Lord’s execution talisman, but all other exorcists deal 1 less slash to the Lord this round." },
          ability3: { title: "Stricture of Banishment", value: "The lord can banish exorcists, making them gradually phase out of reality while inside the kingdom. As a tension move or a threat, the Lord can give an exorcist the following affliction: BANISHED: Starting to fade from reality, with the following effects: • Interacting with the physical world inside the kingdom without using psychic powers becomes hard. However, can also slip through walls and objects like a ghost. • When pressure increases, take 1 stress. If this stress inflicts an injury, suffer instant death instead and disappear completely." },
          ability4: { title: "Stricture of Control", value: "The lord’s power is intense and bleeds out over the investigation area like an iron net. On this mission, the Admin, choosing for the Lord can forbid three items from the following list: • Swearing • Speaking the name of the Lord or its host (in vain or otherwise) • Uncovering skin between the ankles, wrists, and neck in view of the opposite sex • Drinking, eating, or smoking anything not blessed by the Lord • Touching another person skin to skin without consent of the Lord • Entering the palace of the Lord without praying first These rules become known instantly to anyone upon entering the kingdom. Once a scene, when an exorcist would break one of these rules, they take 1d3 stress. If the Admin misses an occurrence of one of these rules being broken but an exorcist reminds them, that exorcist can gain 1 xp. This can only trigger once a session per exorcist." },
          ability5: { title: "Stricture of Memory", value: "The lord’s power is regressive and nostalgic. Inside its Kingdom, it returns everything to a previous era (real or imagined) desirable to its host, such as the European middle ages, Edo Japan, 1950s America, or 1st century Judea. Weapons, gear, and technology that would not exist in that era are converted into similar equivalents inside the Kingdom, or simply do not exist while inside the Kingdom. For example firearms becoming crossbows, or a GPS system becoming a hand drawn map. If the Admin judges this would affect a roll, they can make it hard. All clothing, hairstyles, etc also changes to fit. They revert upon exiting." },
          ability6: { title: "Stricture of Alignment", value: "As a tension move, the Lord can give a randomly rolled role affliction to one of the exorcists inside its kingdom, as the kingdom attempts to absorb them. A role, once given, gives a new (temporary) agenda item to the afflicted exorcist until the end of the mission, as well as forbidden activities, which become hard for the afflicted inside the kingdom. An exorcist can only have one role at once. 1. Peasant: Agenda: Act in extreme deference to others. Forbidden: Acting in defiance of an order. 2. Priest: Agenda: Obey the Lord. Forbidden: Lying, Cheating, taking the Lord’s name in vain. 3. Bandit: Agenda: Steal something. Forbidden: Setup actions or teamwork. 4. Sage: Agenda: Demonstrate your erudition and knowledge. Forbidden: Any physically demanding activity. 5. Knight: Agenda: Protect the residents of the kingdom. Forbidden: Striking a woman. Lying, cheating, or dirty fighting. 6. Noble: Agenda: Humiliate your inferiors. Forbidden: Deferring to an inferior. Dirtying your hands." },
          ability7: { title: "Stricture of Narrative", value: "The lord and its host gain control over reality to the point of being able to reverse causality. • Three times a hunt, when an exorcist rolls an action roll and sees the final result, the lord or its host can declare that events did not actually play out that way, as though they were narrating a story. This completely un-does the outcome of the roll. • The targeted exorcist gains 1 psyche burst. They can then either re-roll the action, taking the second result as final, or lose the outcome and gain an additional 1d3 psyche burst." },
          ability8: { title: "Stricture of The Flaming Sword", value: "The Lord has a Guardian, a sin-construct that patrols the Kingdom with a careful eye and an iron fist. It may take the form of an officer of the law, a winged, beautiful humanoid, or a metallic, geometric construct. If destroyed, it reforms in the Lord’s palace when pressure increases. 144 145 GUARDIAN Guardian (sin) . Execution talisman 3+CAT. • Heavily armored and immune to mundane weaponry • The guardian can move around rapidly while inside the kingdom. It can’t exist outside the kingdom. • The guardian is axiomatic and is incapable of deceit or lying. It always know when someone is lying in its presence. Reactions: Inflict stress. Attacks with: Long ranged weapon (extreme range), brutal melee strikes. (1) 3 stress, (2/3): 2 stress, (4+) : 1 stress. Or: create a complication or threat: Imprison someone in a cage of light, blind with glaring beams, swoop high into the air, summon searing blades, impale with shining spear." },
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "A lord’s palace is always nestled in the center of their kingdom, and therefore always requires traversing the kingdom itself to reach. More often than not, it resembles an actual palace in size and form - or something similarly important and imposing, such as a high rise skyscraper, corporate headquarters, government office, or temple. The palace of a lord is typically a bustling place full of servants or subsidiaries going about their business - minor sins, figments of the host’s imagination, or captive humans that have been absorbed into the narrative of the kingdom. Lord’s palaces are typically: Imposing, grandiose, august, monumental, stony, hallow",
        appearance: "Lords are powerful, imposing figures that present an archetypical ‘guardian’ figure to their hosts, sometimes manifesting as an authority figure like a soldier or policeman, and sometimes as something more divine, like a god or an angel. They have extremely tough armor and are excellent combatants, able to fight off any perceived threats to the new order they impose with ease.",
        traumas: "• What did you lose? • What is the main thing you would fix about the world? • Who did you regret leaving behind when you ascended to your Kingdom?",
        pressure: "The archetypical Lord creates a Kingdom, an alternate parasite reality growing outward from its palace that overlaps our own. The kingdom can be accessed freely by the lord and its host, and can be squirreled away in impossible spaces - accessible through closet doors, hallways, restaurant back alleys, etc. Eventually it starts to bleed over and pull parts of the real world into it, consuming space and the unwitting humans inside. From the outside, humans cannot see the kingdom even as it consumes the real world, and may merely walk down a street and unwittingly pass into an alternate reality. Inside the Kingdom, the world may appear as the world currently does, or a historical or even fantastical version of the world, such as a futuristic city, a glittering heaven, or a medieval castle - dependent on the latent desires of the host. In this world, all that the host has lost is returned to them and more. It presents an alternate reality that is both more convenient and fulfilling to the host and also conforms to their beliefs and outlook, coddling and supporting them. Events, history, and even humans may be altered drastically inside. Therefore humans that on the outside of the kingdom may be hostile to the host might be their friends inside, mistakes the host has made in the past or their own failings might be papered over or made whole - or even celebrated.",
        complications: "Twist the world or landscape, extend the Kingdom, throw false accusations, bind an exorcist in chains, blind with scorching light, extend shining armor plating, raise a glittering shield, add a bystander, use a domain.",
        threats: "Smite with fire, pass judgement from the heavens, hurl into a psychic prison, force an exorcist to confront their own crimes, grasp with an armored fist, impale with holy spikes, Inflict a hook. Use a domain. Do something righteous, scathing, or dominating.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        },         
        severeAttack: {
          description: "The Sin can use this ability on a ‘1’ on the risk roll. They can only use it once a scene. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate. The lord binds the targeted exorcist with divine chains, then begins a summary trial. Start with a pool of 5d6. Then remove one dice for each of the following. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act, suffering consequences as normal if they fail. Uniquely, this may take the form of a verbal argument from any aiding exorcist • Are you innocent of crimes? • Are you a liar or a cheat? • Have you lived a life by your ideals? • Is the lord hindered, distracted, or under duress in any way? Then roll the dice as the Lord passes judgement, smiting the chosen exorcist with fire. The exorcist and any aiding them take 1 stress for every die rolled, no matter the result. For every ‘1’ that comes up, the targeted exorcist is forced to confront their inadequacy and additionally gains 1d6 sin. This could occur multiple times.",
          rollFormula: "5d6"
        },
        afflictions: [
          "Reality Control: Must spend 1 stress to spend any amount of KP in the kingdom.",
          "Pain of Loss: Forced to psychically experience the same catastrophe as the Lord’s host. When the lord or its host is harmed, also take 1 stress. Ends if exorcist takes an injury.",
          "Kingdom infection: Mark off 1 KP when pressure increases, then manifest something comforting and small for your exorcist, like a treat or book.",
          "Hitchhiker: Always count as in the Kingdom for the purposes of the Lord’s powers.",
          "Welcome Home: Gain +1 max psyche burst in the kingdom, regain max psyche burst when resting in the kingdom, but become unable to use blasphemies outside.",
          "Justiciar: Permanently add to your agenda punish wickedness."
        ]
      },
      hound: {
        domains: {
          ability1: { title: "A Shuddering Thing Through a Dark Hall", value: "The hound feeds on fear, growing physically larger and stronger from the terror of weaker wills. Once a scene, if there are mundane humans within the local area, as a complication, the hound can manifest for them and start feeding off their fear. Until the exorcists calm the humans down or remove them from the situation, the hound takes -1 slash on its execution talisman from all sources and deals +1 more stress with reactions. Exorcists that attempt to harm the hound in any way must first spend 1 stress to suppress their fear. They can suppress this effect permanently as part of any action against the hound by answering the question, asked by the admin: What is it you are most afraid of? However, if they choose to answer, the Admin also rolls two risk dice and picks the lowest result for the triggering action." },
          ability2: { title: "Turning Blades, I Laughed at their Brittleness", value: "The hound’s hide becomes incredibly tough and durable, like a beast’s. • Each time an action would slash the hound’s execution talisman, roll a 1d6 fortune roll. If the roll is a 1 or 2, reduce all slashes suffered to 1. The hound’s armor has weak spots, however, and any action that is set up or part of teamwork can ignore this effect. • Mundane weapons are completely incapable of harming the hound unless they are extremely strong, like a tank cannon or a missile." },
          ability3: { title: "The Catching of the Doe", value: "The hound suppresses its nature and becomes a stealthy hunter, able to stalk its prey. At the start of the hunt, pick an exorcist. Once a scene, during any scene, the Admin may declare that the exorcist gets a glimpse of the hound following them (though it may or may not be real), giving them 1 stress, which cannot inflict an injury. The Admin can trigger this three times total a hunt. In any conflict scene, the Hound gets a free reaction at the start (roll the risk die as normal), targeting the exorcist it is stalking if possible." },
          ability4: { title: "The Annihilation of the Wicked", value: "The hound gains a special affinity for firearms. It can attack at range with guns that it wields or, more often, are fused to its form, emerging when needed. • The hound’s attacks gain long range. • As a complication, the hound pins an exorcist down by bullets, bathes them in napalm, concusses them with grenades, etc. That exorcist takes 1 stress after acting until the complication is dealt with, or takes 2 stress if acting requires moving from their current position. • As a reaction (1) the hound can permanently absorb all firearms in the same immediate area as it, immediately disarming anyone wielding one, and healing 1 tick on the execution talisman" },
          ability5: { title: "The Fattening of Rage", value: "strengthening it. • Once a scene, if the hound slays any mundane human as part of a reaction, it can heal 1 segment on its execution talisman. • If the hound has slain at least one of its grudge targets, it increases its execution clock by +2 segments. • If the hound has slain all its original grudge targets, it also inflicts +1 stress with all reactions." },
          ability6: { title: "Rile Against Heaven", value: "The mere presence of the hound exacerbates the rifts between human and exorcist alike. Humans during this mission never start friendly to the exorcists and are often outwardly hostile. The Admin may make a fortune roll if they like (hostile on a 1-2, indifferent or annoyed otherwise). They may still become friendly through the exorcist’s actions. Any two exorcists that have a disagreement, no matter how minor, may declare it has boiled over into a fight. For the remainder of the hunt they cannot participate in teamwork with other and cannot set each other up. Any feuding exorcists regain a psyche burst if the other takes an injury or affliction, and both gain +1 xp at the end of the mission." },
          ability7: { title: "The Measured Weight of Death", value: "The hound gains a supernatural resilience that can only be bypassed by specific methods. Often this draws on the superstitions of its host, often along mythological lines, and doesn’t have to conform to any real logic. • The hound takes -1 slash on its execution talisman. • This effect can be removed for a scene by the exorcists taking action to expose the hound to a specific weakness. The Admin can choose or roll from the list below: 1. Silver 2. Iron 3. Extreme Heat 4. Extreme Cold 5. Water 6. Sunlight" },
          ability8: { title: "Bloodying the Steel", value: "The rage of the Hound is infectious and can drive its victims into a vicious obsessive cycle. The hound gains the Infectious Grudge affliction. exorcist gains +1D on all actions that inflict physical violence, but also takes +1 stress when they take stress from an external source. Any exorcist can voluntarily take this affliction if they are harmed by the hound. " },
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "A hound’s palace is usually an extremely simple, barely coherent and indistinct landscape of whipping winds, boiling rain, unreal heat, and licking flames. Unlike other palaces, it can often change locations as the hound moves around on its hunt. The entrance is usually located somewhere derelict or wild like in abandoned buildings, drainage canals, junk yards, burnt out cars, or in tree hollows. Hound palaces are typically : Hellish, gory, barren, inhospitable, ferocious, chaotic. Pressure: Grudge",
        appearance: "Hounds are active, constantly moving sins that twitch or spasm with barely concealed rage. They often take an animalistic form and may exhibit animalistic behavior such as running on all fours and biting even if they are humanoid in form. They are typically lithe and extremely fast and strong. Humans have an innate fear of them and can sense their presence even if they can’t see a hound. Its surviving victims often describe feeling a primal dread, a sense of being hunted by a wild animal.",
        traumas: "• Who wronged you? • How were you wronged? • What are you unwilling to sacrifice?",
        pressure: "A hound harbors a grudge against a specific person or group of people. While its targets are alive, it does its best to track them down and kill them violently and messily. When setting up the mission, the Admin should designate three specific people to be the hound’s grudge targets (which could have expanded from its original target, or could be examples from a group it has a grudge against). A grudge can easily expand to innocent people, such as family members, friends, or co-workers of the perpetrators. • When pressure increases, the hound will track down and attempt to kill one of its targets. If the exorcists are present, they can attempt to prevent this with a conflict scene. If not, the target is (brutally) slain! • If all targets are killed, the hound picks an NPC the exorcists have met and adds them to its grudge as a new target. If pressure goes to maximum, the hound gains +1 CAT and adds all NPCs and the exorcists to its grudge.",
        complications: "Move faster than the eye can see, set everything on fire, give off massive steam or heat, become enraged, expand with additional blades, increase in size and strength, add a bystander, use a domain.",
        threats: "Cause massive collateral damage. Attempt to tear someone in half. Rip apart humans. Spit torrents of boiling blood. Hurl someone through a roof or wall. Cut everything into ribbons. Inflict a hook. Use a domain. Do something violent, obliterating, or manic.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        },         
        severeAttack: {
          description: "A hound can use this ability on a ‘1’ on the risk roll. They can only use it once a mission. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate. Start with a pool of 5d6. Then remove one dice for each of the following questions you answer ‘yes’ to. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act, suffering consequences as normal if they fail. • Do you have a sword (or something like it) ? • Are you calm, collected, and focused? • Do you have a shield (or something like it)? • Is the hound hindered, distracted, or under duress in some way? Then roll the dice, one at a time. The hound immediately separates the chosen exorcist from the group (hurled into a pocket dimension, smashed through a wall, flung off a freeway,) then also begins attacking them with immeasurable fury, with each dice roll representing an attack. • For every die rolled, the exorcist and anyone aiding them gains 1 stress, no matter what. • For every ‘1’ rolled the targeted exorcist suffers 2 additional stress and has a piece of skin cut away, causing permanent scarring (roll).",
          rollFormula: "5d6"
        },
        afflictions: [
          "Blood Rage: Afflicted exorcists roll +1D when inflicting harm, violence, or physical force, but must take 1 stress to take any other type of action.",
          "Bleeding Eyes: While afflicted, the exorcist may gain a psyche burst by taking 1d3 stress.",
          "Ganglia Fever: Afflicted exorcists are feverish, hot, and roll one less resting die.",
          "Boiling Resentment: At the end of the mission, if you inflicted physical violence on a human, you may erase 2d3 sin. If you do, permanently add to your agenda: make a human pay for their crimes.",
          "Blood Scent: When any exorcist suffers an injury, you may gain a psyche burst. If you did this at least once during a mission, permanently add to your agenda: taste blood.",
          "The Urge: Permanently add to your agenda: kill"
        ]
      },
      centipede: {
        domains: {
          ability1: {
            title: "The Heralds of Venom",
            value: "The venom in the centipede and its horde becomes boiling and pressurized. • The horde can spit venom at short range when inflicting stress. The centipede can spit it at extreme range, like a sniper rifle. • The centipede gains a new affliction: BLINDING AGUE: Can be inflicted as a threat or from a hook. When filled up, eyes become milky white and exorcist becomes unable to see, making activities that rely on sight hard. At the end of mission, roll 1d6, on a ‘1’ this becomes permanent, but exorcist has time to adjust to disability at the start of next mission and it has no further effect. Blind exorcists are immune to this affliction. "
          },
          ability2: {
            title: "Crumbling Into the Darkling Womb",
            value: "The venom exuded by the centipede becomes an environmental aerosol that starts to degrade everything in the investigation area. • Traversing normally safe structures in the area becomes risky or hard as floors start to fall apart, windows melt, and walls collapse • Any mundane item the exorcists have pulled out from their kit degrades and becomes unusable when they rest. • When pressure increases, 10% of the structures in the area are destroyed. If pressure fills up, 90% of the structures in the area are destroyed."
          },
          ability3: {
            title: "The Knights of Decay",
            value: "The horde gains dangerous, armored infested. When the infested appear in a scene, one of these usually appear. 4. Gently Rolling Down the Slope of the Abyss The Centipede’s venom is so potent and fast spreading that it begins to cause catastrophic spread. • Double the casualties per pressure (to 20%). At full segments (6), the spread begins to go outside of the quarantine zone, requiring cleanup from CAIN and docking the exorcists 2 scrip. • When the players meet an NPC, the Admin makes a 1d6 fortune roll. On a ‘1-3’, they have already been bitten but are trying to hide it. • As a tension move, the Admin can choose an uninfected exorcist or NPC who has fought the infested at least once this mission. The Admin reveals they have been bitten, giving them a Centipede Bite. 5. My Children Crawl Quietly The horde gains dangerous, stealthy infested with chameleonic skin. When the infested appear, these appear, always in pairs. 6. At the Core, My Rot Unfurls The Centipede is so fueled by spite it refuses to die and instead takes a momentarily more powerful form. When the centipede’s execution clock is filled up, it instead reduces by 4. The centipede then takes on a terrifying final form. • End the current round and start a new round • In this form, roll the risk die twice and choose the lower result, the centipede takes -1 slash on its talisman and deals +1 stress with all its actions. • However, this form is extremely unstable. At the end of the round, after all exorcists have acted, no matter what, the centipede’s form destabilizes, instantly defeating it and allowing the exorcists the opportunity to finish it off. 7. I Hide My Knife in the Soft Supple Walls The Centipede is able to set festering traps for the exorcists, extruding parts of its body or using the transformed flesh of its infested horde. As a tension move, the Admin can declare that for the next scene, the exorcists are about to enter a trapped area (even if they have already explored it). Moving through the area becomes risky by default. Traps can: inflict 1 stress to one or two exorcists, make an area dangerous or hard to move through, afflict an exorcist, inflict a hook. In addition, in any conflict scene with the Centipede, on a ‘1’ risk result a trap also goes off, with the above effects, in addition to any other reactions. 8. Making Friends With the Abattoir The Centipede gains power from spite, gaining the following benefits: • Once a scene, when it or its minions is able to slaughter an innocent person or bystander in view of the exorcists, permanently increase the centipede’s execution clock by 1, to a maximum of four times total. • Once a hunt, as a tension move, the centipede can reveal a group of human survivors under threat from its forces. If the exorcists rest without aiding the survivors, they are slaughtered and the centipede permanently adds +3 segments to its execution clock."
          },
            ability4: {
            title: "Gently Rolling Down the Slope of the Abyss",
            value: "The Centipede’s venom is so potent and fast spreading that it begins to cause catastrophic spread. • Double the casualties per pressure (to 20%). At full segments (6), the spread begins to go outside of the quarantine zone, requiring cleanup from CAIN and docking the exorcists 2 scrip. • When the players meet an NPC, the Admin makes a 1d6 fortune roll. On a ‘1-3’, they have already been bitten but are trying to hide it. • As a tension move, the Admin can choose an uninfected exorcist or NPC who has fought the infested at least once this mission. The Admin reveals they have been bitten, giving them a Centipede Bite."
          },
          ability5: {
            title: "My Children Crawl Quietly",
            value: "The horde gains dangerous, stealthy infested with chameleonic skin. When the infested appear, these appear, always in pairs. STALKERS Stalkers: Sin/human . Appear as a pair. Execution talisman 3 in a scene between the two of them. At 4+ pressure, increase to 5. • Deal +1 stress to exorcists who are alone or afraid • Focus on one target to the exclusion of all others Reactions: • Inflict stress. Attacks with: Scythe claws, venomous spines • Or: create a complication or threat: Kidnap someone, drag someone into darkness, start jumping or flying on locust-like wings • Or: Chameleonic Scales (1/2): Becomes nearly invisible, making it hard to fight or find them when relying on sight. Next reaction deals +1 stress and ends this effect."
          },
          ability6: {
            title: "At the Core, My Rot Unfurls",
            value: "The Centipede is so fueled by spite it refuses to die and instead takes a momentarily more powerful form. When the centipede’s execution clock is filled up, it instead reduces by 4. The centipede then takes on a terrifying final form. • End the current round and start a new round • In this form, roll the risk die twice and choose the lower result, the centipede takes -1 slash on its talisman and deals +1 stress with all its actions. • However, this form is extremely unstable. At the end of the round, after all exorcists have acted, no matter what, the centipede’s form destabilizes, instantly defeating it and allowing the exorcists the opportunity to finish it off."
          },
          ability7: {
            title: "I Hide My Knife in the Soft Supple Walls",
            value: "The Centipede is able to set festering traps for the exorcists, extruding parts of its body or using the transformed flesh of its infested horde. As a tension move, the Admin can declare that for the next scene, the exorcists are about to enter a trapped area (even if they have already explored it). Moving through the area becomes risky by default. Traps can: inflict 1 stress to one or two exorcists, make an area dangerous or hard to move through, afflict an exorcist, inflict a hook. In addition, in any conflict scene with the Centipede, on a ‘1’ risk result a trap also goes off, with the above effects, in addition to any other reactions."
          },
          ability8: {
            title: "Making Friends With the Abattoir",
            value: "The Centipede gains power from spite, gaining the following benefits: • Once a scene, when it or its minions is able to slaughter an innocent person or bystander in view of the exorcists, permanently increase the centipede’s execution clock by 1, to a maximum of four times total. • Once a hunt, as a tension move, the centipede can reveal a group of human survivors under threat from its forces. If the exorcists rest without aiding the survivors, they are slaughtered and the centipede permanently adds +3 segments to its execution clock."
          }
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "A centipede’s palace is usually located in a protected location at the center of horde activity, usually somewhere significant to the host or close to the inciting incident. The interior of a centipede’s palace often resembles a prison or a dungeon, built to capture the centipede’s host and force them to remain witness to the horrors they have unwittingly (or otherwise) unleashed. This prison can be sterile, cold, or laboratory-like, or medieval and full of barbed hooks and rusted chains. It often manifests horrors or traps to drive out, capture, or kill invaders. Centipede palaces are typically : hostile, resentful, grotesque, gory, prison-like, chthonic",
        appearance: "entipedes are manifested catastrophes, born from the darkest images of their hosts psyche. They exist only to cause such horrific violence and death that the hosts’ previous worries evaporate. As their namesake, they typically manifest as insectile abominations, taking on all the characteristics of what a ‘monster’ should be. Their main identifying physical characteristic is their venom, which is inimical to human life and creates a (very) rapidly expanding problem for exorcists.",
        traumas: "What are you trying to escape? • What do you hate the most about humanity? • What do you regret the most?",
        pressure: "A centipede’s venom, when injected into the human bloodstream, causes a catalyzing psycho-biotic reaction that within the space of about an hour mutates that human into an extremely strong, aggressive, and violent monster, a mindless drone that is under the centipede’s control as a queen controls a colony of ants. These infested are able to produce their own centipede venom that they can inject into bitten humans, creating a catalyzing exponential reaction that rapidly creates a horde of these monsters. • A human infected with centipede venom will chrysalize, transform, and mutate within exactly 44 minutes. An exorcist gains the centipede bite affliction instead. • There is no cure to centipede venom, but it can be delayed. • The only reliable way to end an infestation is to kill the centipede. Executing a centipede causes its venom to lose its transformative effect and evaporate. This saves any infected exorcists and any infected but untransformed victims, who can typically recover in a few weeks. Remaining infested victims are dealt with in cleanup and should be considered deceased. Each time pressure increases, 10% of the local population in the affected area is infected and transformed (so at 3 ticks, 30% of the population is affected). If pressure reaches maximum, the centipede increases in CAT by +1 and this goes up to 90% population loss.",
        complications: "Burrow into the ground or walls, spit poisonous webbing, release swarms of flies, spray pools of poison, reveal hidden burrows, collapse the floor, scuttle hidden into darkness, add a bystander, use a domain.",
        threats: "Summon the horde. Rip into an exorcist. Unveil rows of hypnotic eyespots. Explode a caustic bubo. Dissolve something with acid. Commit a massacre. Inflict a hook. Use a domain. Do something messy, spiteful, or dripping with venom.",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "1 stress",
          rollFormula: "1d6"
        },
        severeAttack: {
          description: "The Sin can use this ability on a ‘1’ on the risk roll. They can only use it once a mission. Target an exorcist. Any other exorcists nearby must decide to fly to their aid. Any that don’t offer aid cannot participate.Start with a pool of 5d6. Then remove one dice for each of the following. If an answer is ‘no’, you or someone aiding you can immediately make a single action roll to attempt rectify the answer, with only a few moments to act, suffering consequences as normal if they fail. • Can you move quickly and unencumbered? • Is someone aiding you able to push or grab you? • Can you forgive the centipede’s host? • Is the centipede hindered, distracted, or under duress in some way? Then roll the dice. The centipede shoots a pressurized stream of mutagenic venom at the targeted exorcist, dissolving all obstacles and flesh in its way with incredible force. The exorcist and any aiding them take 1 stress for every die rolled, no matter the result. If at least one ‘1’ comes up, the targeted exorcist suffers an injury and rolls on the table for a permanent scar. If two or more ‘1’s come up, the exorcist targeted either: • suffers instant death. • suffers sin overflow to avoid instant death • suffers an injury and rolls three times on the table instead for permanent scars 1. Missing eye, fused shut 2. Large bleached patch of skin 3. Fingers on one hand melted together 4. Missing hair, burn scar on scalp 5. Massive burn scar over both arms 6. Rippling acid burn from neck to groin ",
          rollFormula: "5d6"
        },
        afflictions: [
          "Seethe: Pick another exorcist. For every ‘6’ that exorcist rolls on an action, gain 1 stress.",
          "Limb Necrosis: Limb starts swelling and rotting from the inside (1-2: Arm, 3-4: leg, 6: hand or foot). Activity that would require it is hard.",
          "Acid Degradation: Mark off 1d3 KP immediately, then mark off 1 more when you rest.",
          "Alienation: Permanently add to your agenda: ignore a plea for aid.",
          "Hive Brain: Hallucination from aerosol poison. Performing complicated mental activity such as research or investigation is hard.",
          "Let it End: Permanently add to your agenda: Kill Needlessly."
        ]
      },
      redacted: {
        domains: {
          ability1: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability2: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability3: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability4: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability5: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability6: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability7: {
            title: "The Redacted",
            value: "The Redacted",
          },
          ability8: {
            title: "The Redacted",
            value: "The Redacted",
          }
        },
        selectedAbilities: {
          selectedAbility1: "",
          selectedAbility2: "",
          selectedAbility3: "",
        },
        palace: "The Redacted",
        appearance: "The Redacted",
        traumas: "The Redacted",
        pressure: "The Redacted",
        complications: "The Redacted",
        threats: "The Redacted",
        attackRoll: {
          lowDamage: "1 stress",
          mediumDamage: "2 stress",
          highDamage: "3 stress",
          rollFormula: "1d6"
        },
        severeAttack: {
          description: "The Redacted",
          rollFormula: "5d6"
        },
        afflictions: [
          "The Redacted",
          "The Redacted",
          "The Redacted",
          "The Redacted",
          "The Redacted",
          "The Redacted"
        ]
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
        'system.selectedAbilities': sinTypeData.selectedAbilities,
        'system.complications': sinTypeData.complications,
        'system.threats': sinTypeData.threats,
        'system.attackRoll': sinTypeData.attackRoll,
        'system.severeAttack': sinTypeData.severeAttack,
        'system.afflictions': sinTypeData.afflictions
      });
    }
  }

}