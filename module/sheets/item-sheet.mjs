import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

// Use v13 namespaced ItemSheet with fallback for v11/v12
const BaseItemSheet = foundry?.appv1?.sheets?.ItemSheet ?? ItemSheet;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CainItemSheet extends BaseItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['cain', 'sheet', 'item'],
      width: 640,
      height: 640,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
      dragDrop: [{ dropSelector: null }],
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
    if (this.item.type === "blasphemy") {
      context.blasphemyPassives = this.item.system.powers.map(item => {return game.items.get(item);}).filter(item => {return item.system.isPassive});
      context.blasphemyPowers = this.item.system.powers.map(item => {return game.items.get(item);}).filter(item => {return !item.system.isPassive});
    }
    if (this.item.type === "sinMark") {
      console.log("Context:", context)
      console.log("Item:", this.item)
      context.sinMarkAbilities = this.item.system.abilities.map(item => {return game.items.get(item);});
    }

    if (this.item.type === "domain") {
      const affliction = this._getItemFromID(this.item.system.afflictionEffect);
      console.log(affliction);
      context.afflictionName = affliction?.name || null;
      context.afflictionDescription = affliction?.system.afflictionDescription || null;
    }

    if (this.item.type === "bond") {
      // Get bond abilities and sort by bond level
      context.bondAbilities = this.item.system.abilities
        .map(id => game.items.get(id))
        .filter(item => item) // Filter out null/undefined
        .sort((a, b) => a.system.bondLevel - b.system.bondLevel);

      // Get strictures as an array for easier iteration
      context.stricturesList = this.item.system.strictures || [];

      // Get high blasphemy data if set
      if (this.item.system.highBlasphemy) {
        context.highBlasphemyData = game.items.get(this.item.system.highBlasphemy);
      }
    }

    context.developerMode = game.settings.get('cain', 'developerMode');
    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.CAIN
    context.config = CONFIG.CAIN;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    // Set CSS variables for colors
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.item.system.primaryColor || '#000000');
    root.style.setProperty('--accent-color', this.item.system.accentColor || '#FFFFFF');
    root.style.setProperty('--secondary-color', this.item.system.secondaryColor || '#CCCCCC');
    root.style.setProperty('--text-color', this.item.system.textColor || '#000000');

    return context;
  }

  _getItemFromID(id) {
    return game.items.get(id);
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

    // Color pickers
    html.find('input[type="color"]').on('input', this._updateColor.bind(this, html));

    // html click item to open
    html.find('.item-click').click((event) => {
        console.log('Item clicked');
        console.log(event.currentTarget)
        const itemId = $(event.currentTarget).data('id');
        console.log(itemId);
        const item = Item.get(itemId);
        console.log(item);
        if (item) {
          item.sheet.render(true);
        }
      });
    
    // Setup color picker functionality
    setupColorPicker(html);

    function setupColorPicker(html) {
      html.find('.color-picker-toggle').click(() => {
        console.log('Color picker toggle clicked');
        const colorPickerContainer = html.find('.color-picker-container');
        console.log(colorPickerContainer);
        const colorPickers = html.find('.color-pickers');
        console.log(colorPickerContainer.hasClass('active'));

        if (colorPickerContainer.hasClass('active')) {
          console.log('Closing color picker');
          colorPickers.css('transform', 'translateX(-30px)');
          colorPickers.css('opacity', '0');
          colorPickers.css('pointer-events', 'none'); // Disable interaction
          setTimeout(() => {
            colorPickerContainer.removeClass('active');
          }, 500); // Match the transition duration
        } else {
          colorPickerContainer.addClass('active');
          setTimeout(() => {
            colorPickers.css('transform', 'translateX(0)');
            colorPickers.css('opacity', '1');
            colorPickers.css('pointer-events', 'auto'); // Enable interaction
          }, 10); // Small delay to trigger the transition
        }
      });

      html.on('click', (event) => {
        const colorPickerContainer = html.find('.color-picker-container');
        const colorPickerToggle = html.find('.color-picker-toggle');
        const colorPickers = html.find('.color-pickers');

        if (!colorPickerContainer.is(event.target) && !colorPickerToggle.is(event.target) && colorPickerContainer.has(event.target).length === 0) {
          colorPickerContainer.removeClass('active');
          colorPickers.css('transform', 'translateX(-30px)');
          colorPickers.css('opacity', '0');
          colorPickers.css('pointer-events', 'none'); // Disable interaction
        }
      });
    }

    // Add ability to the page
    html.find('#addAbility').click(this._addAbility.bind(this));
    html.find('#removeAbility').click(this._removeAbility.bind(this));

    if (this.item.type === "domain") {
      html.find('#remove-domain-affliction-button').click(this._removeDomainAffliction.bind(this))

      html.find(".affliction-drop-target").on("drop", async event => {
        event.preventDefault();
        const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
        const itemDrop = await Item.fromDropData(data);
        if (itemDrop.type !== "affliction") return;
        console.log(`You dropped ${itemDrop.name}!`);
        this._addAfflictionToDomain(itemDrop);
      });

      html.find('#sinTypeSelect').change(event => {
        const sinType = event.target.value;
        this._onSinTypeSelect(sinType);
      });
    }
  }

  _onSinTypeSelect(sinType) {
    let imgPath;
    switch (sinType) {
      case 'ogre':
        imgPath = 'systems/cain/assets/Sins/ogre.png';
        break;
      case 'lord':
        imgPath = 'systems/cain/assets/Sins/lord.png';
        break;
      case 'centipede':
        imgPath = 'systems/cain/assets/Sins/centipede.png';
        break;
      case 'hound':
        imgPath = 'systems/cain/assets/Sins/hound.png';
        break;
      case 'idol':
        imgPath = 'systems/cain/assets/Sins/idol.png';
        break;
      case 'toad':
        imgPath = 'systems/cain/assets/Sins/toad.png';
        break;
      default:
        imgPath = 'systems/cain/assets/Sins/generic_sin.png';
        break;
    }

    this.item.update({ img: imgPath });
  }

  _addAfflictionToDomain(item) {
    console.log(item.id);
    this.item.update({'system.afflictionEffect': item.id})
      .then(() => { console.log('updated item!', this.item); })
    .catch(error => console.log(error));
  }

  _removeDomainAffliction(event) {
    event.preventDefault();
    this.item.update({ 'system.afflictionEffect': null });
    // Bond-specific listeners
    html.find('#addStricture').click(this._addStricture.bind(this));
    html.find('.remove-stricture').click(this._removeStricture.bind(this));
    html.find('#setHighBlasphemy').click(this._setHighBlasphemy.bind(this));
    html.find('.remove-high-blasphemy').click(this._removeHighBlasphemy.bind(this));
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

  _updateColor(html, event) {
    const colorType = event.target.getAttribute('data-id');
    const colorValue = event.target.value;
    const eventId = event.target.id;
    console.log(`Color picker event: ${eventId}`);
    console.log(`Updating color: ${colorType} to ${colorValue}`);
    this.item.update({[`system.${eventId}`]: colorValue}, {render: false}).then(() => {
      html[0].style.setProperty(`--${colorType}`, colorValue);
      console.log(`CSS variable --${colorType} set to ${colorValue}`);
    }).catch(err => {
      console.error(`Error updating item with ${colorType}: ${colorValue}`, err);
    });
  }

  async _addAbility(event) {
    event.preventDefault();
    const abilityUUID = event.currentTarget.parentElement.querySelector('#abilityUUID').value;
    const abilityItem = await fromUuid(abilityUUID);
    if (abilityItem) {
      const abilities = this.item.system.abilities || [];
      abilities.push(abilityItem.id);
      await this.item.update({ 'system.abilities': abilities });
      ui.notifications.info(`Added ability: ${abilityItem.name}`);
    } else {
      ui.notifications.error('Invalid ability UUID');
    }
  }

  async _removeAbility(event) {
    event.preventDefault();
    const abilities = this.item.system.abilities || [];
    if (abilities.length > 0) {
      const lastAbilityId = abilities.pop();
      const lastAbilityItem = game.items.get(lastAbilityId);
      await this.item.update({ 'system.abilities': abilities });
      ui.notifications.info(`Removed ability: ${lastAbilityItem.name}`);
    } else {
      ui.notifications.error('No abilities to remove');
    }
  }

  async _addStricture(event) {
    event.preventDefault();
    const strictureInput = event.currentTarget.parentElement.querySelector('#newStricture');
    const strictureText = strictureInput?.value?.trim();
    if (strictureText) {
      const strictures = this.item.system.strictures || [];
      strictures.push(strictureText);
      await this.item.update({ 'system.strictures': strictures });
      strictureInput.value = '';
      ui.notifications.info(`Added stricture: ${strictureText}`);
    } else {
      ui.notifications.error('Please enter a stricture');
    }
  }

  async _removeStricture(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const strictures = this.item.system.strictures || [];
    if (index >= 0 && index < strictures.length) {
      const removed = strictures.splice(index, 1);
      await this.item.update({ 'system.strictures': strictures });
      ui.notifications.info(`Removed stricture`);
    }
  }

  async _setHighBlasphemy(event) {
    event.preventDefault();
    const uuidInput = event.currentTarget.parentElement.querySelector('#highBlasphemyUUID');
    const uuid = uuidInput?.value?.trim();
    if (uuid) {
      // Try to get the item - could be an ID or UUID
      let blasphemyPowerItem = game.items.get(uuid);
      if (!blasphemyPowerItem) {
        blasphemyPowerItem = await fromUuid(uuid);
      }
      if (blasphemyPowerItem && blasphemyPowerItem.type === 'blasphemyPower') {
        await this.item.update({ 'system.highBlasphemy': blasphemyPowerItem.id });
        ui.notifications.info(`Set high blasphemy power: ${blasphemyPowerItem.name}`);
      } else {
        ui.notifications.error('Invalid blasphemy power UUID/ID - must be a Blasphemy Power item');
      }
    } else {
      // Clear the high blasphemy
      await this.item.update({ 'system.highBlasphemy': '' });
      ui.notifications.info('Cleared high blasphemy power');
    }
  }

  async _removeHighBlasphemy(event) {
    event.preventDefault();
    await this.item.update({ 'system.highBlasphemy': '' });
    ui.notifications.info('Removed high blasphemy power');
  }

  /** @override */
  async _updateObject(event, formData) {
    // Handle the form submission
    // formData contains all the form fields with their names as keys

    // Convert formData to expanded object format
    const expanded = foundry.utils.expandObject(formData);

    // For blasphemyPower items, sync the name to system.powerName
    if (this.item.type === 'blasphemyPower' && formData.name) {
      if (!expanded.system) expanded.system = {};
      expanded.system.powerName = formData.name;
    }

    // Update the item with the new data
    return await this.item.update(expanded);
  }

  /** @override */
  async _onDrop(event) {
    event.preventDefault();

    // Only handle drops for bond items
    if (this.item.type !== 'bond') return;

    // Get the dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return;
    }

    // Handle different drop types
    if (data.type === 'Item') {
      return this._onDropItem(event, data);
    }
  }

  async _onDropItem(event, data) {
    // Only handle for bond items
    if (this.item.type !== 'bond') return;

    // Get the dropped item
    const droppedItem = await Item.fromDropData(data);
    if (!droppedItem) return;

    // Handle bondAbility drops - add to abilities array
    if (droppedItem.type === 'bondAbility') {
      const abilities = this.item.system.abilities || [];

      // Check if already added
      if (abilities.includes(droppedItem.id)) {
        ui.notifications.warn(`${droppedItem.name} is already added to this bond.`);
        return;
      }

      abilities.push(droppedItem.id);
      await this.item.update({ 'system.abilities': abilities });
      ui.notifications.info(`Added ability: ${droppedItem.name}`);
      return;
    }

    // Handle blasphemyPower drops - set as high blasphemy
    if (droppedItem.type === 'blasphemyPower') {
      await this.item.update({ 'system.highBlasphemy': droppedItem.id });
      ui.notifications.info(`Set high blasphemy power: ${droppedItem.name}`);
      return;
    }

    ui.notifications.warn('You can only drop Bond Abilities or Blasphemy Powers onto a Bond sheet.');
  }

}