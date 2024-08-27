import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CainItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cain', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/cain/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    if (this.item.type === "agenda") {
      context.agendaBoldedTaskData = this.item.system.boldedTasks.map(item => {return game.items.get(item);});
      context.agendaUnboldedTaskData = this.item.system.unboldedTasks.map(item => {return game.items.get(item);});
      context.agendaAbilityData = this.item.system.abilities.map(item => {return game.items.get(item);});
      console.log(this.item.system.abilities);
      console.log(context.agendaAbilityData);
      context.agenda_tasks = game.items.contents.map(item => { if (item.type === "agendaTask")
        return {
          id: item.id,
          name: item.name
        }; return {name: "INVALID"};
      }).filter(item => item.name !== "INVALID");
      context.agenda_abilities = game.items.contents.map(item => { if (item.type === "agendaAbility")
        return {
          id: item.id,
          name: item.name
        };; return {name: "INVALID"};
      }).filter(item => item.name !== "INVALID");  
    }
    context.developerMode = game.settings.get('cain', 'developerMode');
    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.CAIN
    context.config = CONFIG.CAIN;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );

    html.find('#addTaskToAgenda').click(this._addTaskToAgenda.bind(this));
  }

  _addTaskToAgenda(event) {
    let value = event.currentTarget.parentElement.parentElement.querySelector('#selectedItem').value

    const unboldedTasks = this.item.system.unboldedTasks || [];
    const boldedTasks = this.item.system.unboldedTasks || [];
    console.log(unboldedTasks);
    console.log(boldedTasks);
    const newTask = value;
    const newTaskItem = game.items.get(newTask);
    if (newTaskItem.system.isBold) {
      boldedTasks.push(newTask);
      this.item.update({'system.boldedTasks': boldedTasks});
    } else {
      unboldedTasks.push(newTask);
      this.item.update({'system.unboldedTasks': unboldedTasks});
    }
    console.log(newTask)
    console.log(this.item.system);
  }
}
