import { CainAgenda, CainAgendaTask, CainAgendaAbility } from "../data/_module.mjs";
import { CainBlasphemy, CainBlasphemyPower } from "../data/_module.mjs";
import { CainAffliction } from "../data/_module.mjs";
import { CainItem } from "../data/_module.mjs";
import { CainSinMark, CainSinMarkAbility } from "../data/_module.mjs";

export class HomebrewWindow extends Application {
    constructor(options = {}) {
        super(options);
        this.history = this.loadHistory();
        this.settings = this.loadSettings();
    }

    loadHistory() {
        try {
            const historyData = game.settings.get('cain', 'homebrewHistory');
            return historyData || [];
        } catch (e) {
            return [];
        }
    }

    loadSettings() {
        try {
            const settingsData = game.settings.get('cain', 'homebrewFolderSettings');
            return settingsData || {
                agendaFolder: '',
                blasphemyFolder: '',
                powerFolder: '',
                bondFolder: '',
                bondAbilityFolder: '',
                afflictionFolder: '',
                itemFolder: '',
                sinMarkFolder: '',
                importFolder: ''
            };
        } catch (e) {
            return {
                agendaFolder: '',
                blasphemyFolder: '',
                powerFolder: '',
                bondFolder: '',
                bondAbilityFolder: '',
                afflictionFolder: '',
                itemFolder: '',
                sinMarkFolder: '',
                importFolder: ''
            };
        }
    }

    saveSettings() {
        try {
            game.settings.set('cain', 'homebrewFolderSettings', this.settings);
        } catch (e) {
            console.error("Failed to save settings:", e);
        }
    }

    saveHistory() {
        try {
            game.settings.set('cain', 'homebrewHistory', this.history);
        } catch (e) {
            console.error("Failed to save history:", e);
        }
    }

    addToHistory(item) {
        this.history.unshift({
            ...item,
            timestamp: Date.now(),
            date: new Date().toLocaleString()
        });
        this.saveHistory();
    }

    agendaOptions = {
        name: "New Agenda",
        tasks: [{
                task: "Primary Task",
                isBold: false    
            },
            {
                task: "Secondary Task",
                isBold: true    
            }],
        abilities: [{
            name: "Ability 1",
            abilityDescription: "Ability Description"
        },
        {
            name: "Ability 2",
            abilityDescription: "Ability Description"
        },
        {
            name: "Ability 3",
            abilityDescription: "Ability Description"
        },
        {
            name: "Ability 4",
            abilityDescription: "Ability Description"
        },
        {
            name: "Ability 5",
            abilityDescription: "Ability Description"
        },
        {
            name: "Ability 6",
            abilityDescription: "Ability Description"
        },
        ]
    }

    sinMarkOptions = {
        name: "New Sin Mark",
        description: "",
        abilities: [
            {
                name: "Ability 1",
                abilityDescription: "Ability Description"
            },
            {
                name: "Ability 2",
                abilityDescription: "Ability Description"
            }
        ]
    }

    bondOptions = {
        name: "New Bond",
        virtueName: "New Virtue",
        highBlasphemyLevel: 1,
        strictures: []
    }

    bondAbilityOptions = {
        name: "New Bond Ability",
        bondLevel: 0,
        abilityDescription: "",
        isPermanent: true,
        requiresPsycheBurst: false,
        psycheBurstCost: 1
    }

    blasphemyOptions = {
        name: "New Blasphemy",
        powers: [{
            name: "Power 1",
            isPassive: true,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 2",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 3",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 4",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 5",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 6",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        },
        {
            name: "Power 7",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        }]
    }

    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: 'homebrew-window',
        title: 'Create Homebrew',
        template: 'systems/cain/templates/homebrew-window.hbs',
        width: 1000,
        height: 1000,
        resizable: true,
        tabs: [
            {
              navSelector: '.sheet-tabs',
              contentSelector: '.sheet-body',
              initial: 'description',
            },
          ],    
      });
    }
  
    getData() {
        const itemFolders = game.folders.filter(f => f.type === "Item");

        return {
            agendaOptions: this.agendaOptions,
            blasphemyOptions: this.blasphemyOptions,
            sinMarkOptions: this.sinMarkOptions,
            bondOptions: this.bondOptions,
            bondAbilityOptions: this.bondAbilityOptions,
            settings: this.settings,
            availableFolders: itemFolders.map(f => ({ id: f.id, name: f.name }))
        }
    }
  
    activateListeners(html) {
      super.activateListeners(html);
      html.find('.homebrew-agenda-name-input').change(this._onChangeAgendaName.bind(this));
      html.find('.homebrew-toggle-bold').click(this._onToggleBold.bind(this));
      html.find('.homebrew-new-task').click(this._onCreateNewTask.bind(this));
      html.find('.homebrew-task-input').change(this._onChangeTaskName.bind(this));
      html.find('.homebrew-remove-task').click(this._onRemoveTask.bind(this));
      html.find('.homebrew-new-ability').click(this._onCreateNewAbility.bind(this));
      html.find('.homebrew-ability-name-input').change(this._onChangeAbilityName.bind(this));
      html.find('.homebrew-ability-input').change(this._onChangeAbilityDescription.bind(this));
      html.find('.homebrew-remove-ability').click(this._onRemoveAbility.bind(this));
      html.find('.homebrew-submit-agenda').click(this._onSubmitAgenda.bind(this));
      

      html.find('.homebrew-blasphemy-name-input').change(this._onChangeBlasphemyName.bind(this));
      html.find('.homebrew-new-power').click(this._onCreateNewPower.bind(this));
      html.find('.homebrew-power-name-input').change(this._onChangePowerName.bind(this));
      html.find('.homebrew-power-passive-input').change(this._onChangePowerPassive.bind(this));
      html.find('.homebrew-power-psyche-cost').change(this._onChangePowerPsycheCost.bind(this));
      html.find('.homebrew-power-psyche-no-cost').change(this._onChangePowerPsycheNoCost.bind(this));
      html.find('.homebrew-power-psyche-mult').change(this._onChangePowerPsycheMult.bind(this));
      html.find('.homebrew-power-tags-input').change(this._onChangePowerTags.bind(this));
      html.find('.homebrew-power-input').change(this._onChangePowerDescription.bind(this));
      html.find('.homebrew-remove-power').click(this._onRemovePower.bind(this));
      html.find('.homebrew-submit-blasphemy').click(this._onSubmitBlasphemy.bind(this));

      html.find('.homebrew-submit-affliction').click(this._onSubmitAffliction.bind(this));
      html.find('.homebrew-submit-item').click(this._onSubmitItem.bind(this));
      html.find('.homebrew-submit-standalone-power').click(this._onSubmitStandalonePower.bind(this));

      html.find('.homebrew-new-sinmark-ability').click(this._onCreateNewSinMarkAbility.bind(this));
      html.find('.homebrew-sinmark-ability-name-input').change(this._onChangeSinMarkAbilityName.bind(this));
      html.find('.homebrew-sinmark-ability-description-input').change(this._onChangeSinMarkAbilityDescription.bind(this));
      html.find('.homebrew-remove-sinmark-ability').click(this._onRemoveSinMarkAbility.bind(this));
      html.find('.homebrew-submit-sinmark').click(this._onSubmitSinMark.bind(this));

      // Bond listeners
      html.find('.homebrew-new-stricture').click(this._onCreateNewStricture.bind(this));
      html.find('.homebrew-stricture-input').change(this._onChangeStricture.bind(this));
      html.find('.homebrew-remove-stricture').click(this._onRemoveStricture.bind(this));
      html.find('.homebrew-submit-bond').click(this._onSubmitBond.bind(this));

      // Bond Ability listeners
      html.find('#bond-ability-requires-psyche').change(this._onTogglePsycheCost.bind(this));
      html.find('.homebrew-submit-bond-ability').click(this._onSubmitBondAbility.bind(this));

      // Import/Export listeners
      html.find('.homebrew-export-selected').click(this._onExportSelected.bind(this));
      html.find('.homebrew-export-all-content').click(this._onExportAll.bind(this));
      html.find('.homebrew-choose-file').click(this._onChooseFile.bind(this));
      html.find('#homebrew-import-file').change(this._onFileSelected.bind(this));
      html.find('.homebrew-confirm-import').click(this._onConfirmImport.bind(this));
      html.find('#export-select-all').change(this._onToggleSelectAll.bind(this));

      // Reverse import listeners
      html.find('#reverse-import-type').change(this._onReverseImportTypeChange.bind(this));
      html.find('#reverse-import-item').change(this._onReverseImportItemChange.bind(this));
      html.find('.homebrew-load-item').click(this._onLoadItemForEditing.bind(this));

      // History listeners
      html.find('#history-filter').change(this._onFilterHistory.bind(this));
      html.find('.homebrew-clear-history').click(this._onClearHistory.bind(this));
      html.find('.homebrew-export-all').click(this._onExportAll.bind(this));
      html.find('.homebrew-import').click(this._onChooseFile.bind(this));

      // Settings listeners
      html.find('.settings-folder-select').change(this._onChangeFolderSetting.bind(this));
      html.find('.homebrew-save-settings').click(this._onSaveSettings.bind(this));
      html.find('.homebrew-reset-settings').click(this._onResetSettings.bind(this));

      // Populate export list and history on render
      this._populateExportList(html);
      this._populateHistory(html);

    }


    _onCreateNewPower(event) {
        event.preventDefault();
        const newIndex = this.blasphemyOptions.powers.length;
        this.blasphemyOptions.powers.push({
            name: "",
            isPassive: false,
            keywords: "",
            powerDescription: "",
            psycheBurstCost: false,
            psycheBurstNoCost: false,
            psycheBurstMultCost: false
        });

        // Add new power to DOM without re-rendering
        const powerList = this.element.find('.power-list');
        const newPowerHtml = `
            <li class='power-item'>
                <div class="power-header-row">
                    <input type="text" class="homebrew-input homebrew-power-name-input" data-power-index="${newIndex}" placeholder="Power name..." value="">
                    <label class="checkbox-label">
                        <input type="checkbox" class="homebrew-power-passive-input" data-power-index="${newIndex}">
                        <span>Passive</span>
                    </label>
                    <button type="button" class="btn-icon btn-delete homebrew-remove-power" data-power-index="${newIndex}" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="power-details">
                    <div class="psyche-burst-options">
                        <label class="psyche-label">Psyche Burst:</label>
                        <label class="checkbox-label small">
                            <input type="checkbox" class="homebrew-power-psyche-cost" data-power-index="${newIndex}">
                            <span><i class="fas fa-circle"></i> Uses</span>
                        </label>
                        <label class="checkbox-label small">
                            <input type="checkbox" class="homebrew-power-psyche-no-cost" data-power-index="${newIndex}">
                            <span><i class="fas fa-times"></i> No-Cost Mode</span>
                        </label>
                        <label class="checkbox-label small">
                            <input type="checkbox" class="homebrew-power-psyche-mult" data-power-index="${newIndex}">
                            <span><i class="fas fa-plus"></i> Multiple</span>
                        </label>
                    </div>
                    <input type="text" class="homebrew-input homebrew-power-tags-input" data-power-index="${newIndex}" placeholder="Keywords (comma-separated)..." value="">
                    <textarea class="homebrew-input homebrew-power-input" data-power-index="${newIndex}" placeholder="Power description (use CAT formatting)..."></textarea>
                </div>
            </li>
        `;
        powerList.append(newPowerHtml);

        // Re-bind events for the new elements
        const newItem = powerList.find(`.power-item:last`);
        newItem.find('.homebrew-power-name-input').change(this._onChangePowerName.bind(this));
        newItem.find('.homebrew-power-passive-input').change(this._onChangePowerPassive.bind(this));
        newItem.find('.homebrew-power-psyche-cost').change(this._onChangePowerPsycheCost.bind(this));
        newItem.find('.homebrew-power-psyche-no-cost').change(this._onChangePowerPsycheNoCost.bind(this));
        newItem.find('.homebrew-power-psyche-mult').change(this._onChangePowerPsycheMult.bind(this));
        newItem.find('.homebrew-power-tags-input').change(this._onChangePowerTags.bind(this));
        newItem.find('.homebrew-power-input').change(this._onChangePowerDescription.bind(this));
        newItem.find('.homebrew-remove-power').click(this._onRemovePower.bind(this));

        // Focus the new input
        newItem.find('.homebrew-power-name-input').focus();
    }

    _onRemovePower(event) {
        event.preventDefault();
        const powerIndex = parseInt(event.currentTarget.getAttribute('data-power-index'));
        this.blasphemyOptions.powers.splice(powerIndex, 1);

        // Remove from DOM and re-index remaining items
        const powerList = this.element.find('.power-list');
        const items = powerList.find('.power-item');
        items.eq(powerIndex).remove();

        // Re-index remaining items
        powerList.find('.power-item').each((index, item) => {
            $(item).find('[data-power-index]').attr('data-power-index', index);
        });
    }

    _onChangeBlasphemyName(event) {
        event.preventDefault();
        this.blasphemyOptions.name = event.currentTarget.value;
    }

    _onChangePowerName(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].name = event.currentTarget.value;
    }

    _onChangePowerDescription(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].powerDescription = event.currentTarget.value;
    }

    _onChangePowerPassive(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].isPassive = event.currentTarget.checked;
    }

    _onChangePowerTags(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].keywords = event.currentTarget.value;
    }

    _onChangePowerPsycheCost(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].psycheBurstCost = event.currentTarget.checked;
    }

    _onChangePowerPsycheNoCost(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].psycheBurstNoCost = event.currentTarget.checked;
    }

    _onChangePowerPsycheMult(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].psycheBurstMultCost = event.currentTarget.checked;
    }

    async _onSubmitBlasphemy(event) {
        event.preventDefault();

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('blasphemy');

        let blasphemyFolderFolder = game.folders.find(f => f.name === "Blasphemies" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!blasphemyFolderFolder) {
            blasphemyFolderFolder = await Folder.create({
                name: "Blasphemies",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        let blasphemyFolder = game.folders.find(f => f.name === this.blasphemyOptions.name && f.type === "Item" && f.folder?.id === blasphemyFolderFolder.id);
        if (!blasphemyFolder) {
            blasphemyFolder = await Folder.create({
                name: this.blasphemyOptions.name,
                type: "Item",
                folder: blasphemyFolderFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let blasphemyPowerFolder = game.folders.find(f => f.name === (this.blasphemyOptions.name + " Powers") && f.type === "Item");
        if (!blasphemyPowerFolder) {
            blasphemyPowerFolder = await Folder.create({
                name: (this.blasphemyOptions.name + " Powers"),
                type: "Item",
                folder: blasphemyFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        const powerList = [];
        for (const index in this.blasphemyOptions.powers) {
            const power = this.blasphemyOptions.powers[index];
            const createdPowerData = {
                name: power.name,
                type: "blasphemyPower", // Ensure this matches the item type defined in your game system
                img: "icons/svg/item-bag.svg",
                folder: blasphemyPowerFolder.id,  // Assign the item to the folder
                system: {
                    blasphemyType: this.blasphemyOptions.name,
                    powerName: power.name,
                    isPassive: power.isPassive,
                    keywords: power.keywords,
                    powerDescription: power.powerDescription,
                    psycheBurstCost: power.psycheBurstCost || false,
                    psycheBurstNoCost: power.psycheBurstNoCost || false,
                    psycheBurstMultCost: power.psycheBurstMultCost || false
                }
            };
            const createdPower = await Item.create(createdPowerData);
            powerList.push(createdPower.id);
            console.log(createdPower);
        }
        const createdBlasphemyData = {
            name: this.blasphemyOptions.name,
            type: "blasphemy",
            img: "icons/svg/item-bag.svg",
            folder: blasphemyFolder.id, // Assign the item to the folder
            system: {
                blasphemyName: this.blasphemyOptions.name,
                powers: powerList,
            }
        };
        console.log(createdBlasphemyData);
        const createdBlasphemy = await Item.create(createdBlasphemyData);
        console.log(createdBlasphemy);

        // Add to history
        this.addToHistory({
            id: createdBlasphemy.id,
            name: this.blasphemyOptions.name,
            type: "blasphemy",
            icon: "fa-book-dead"
        });

        ui.notifications.info(`Blasphemy "${this.blasphemyOptions.name}" created successfully!`);
    }

    _onCreateNewTask(event) {
        event.preventDefault();
        const newIndex = this.agendaOptions.tasks.length;
        this.agendaOptions.tasks.push({
            task: "",
            isBold: false
        });

        // Add new task to DOM without re-rendering
        const taskList = this.element.find('.task-list');
        const newTaskHtml = `
            <li class='task-item'>
                <textarea class="homebrew-input homebrew-task-input" data-task-index="${newIndex}" placeholder="Task description..." style="font-weight: normal;"></textarea>
                <div class="task-controls">
                    <button type="button" class="btn-icon homebrew-toggle-bold" data-task-index="${newIndex}" title="Bold Text">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" class="btn-icon btn-delete homebrew-remove-task" data-task-index="${newIndex}" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
        taskList.append(newTaskHtml);

        // Re-bind events for the new elements
        const newItem = taskList.find(`.task-item:last`);
        newItem.find('.homebrew-task-input').change(this._onChangeTaskName.bind(this));
        newItem.find('.homebrew-toggle-bold').click(this._onToggleBold.bind(this));
        newItem.find('.homebrew-remove-task').click(this._onRemoveTask.bind(this));

        // Focus the new textarea
        newItem.find('.homebrew-task-input').focus();
    }

    _onCreateNewAbility(event) {
        event.preventDefault();
        const newIndex = this.agendaOptions.abilities.length;
        this.agendaOptions.abilities.push({
            name: "",
            abilityDescription: ""
        });

        // Add new ability to DOM without re-rendering
        const abilityList = this.element.find('.ability-list');
        const newAbilityHtml = `
            <li class='ability-item'>
                <input type="text" class="homebrew-input homebrew-ability-name-input" data-ability-index="${newIndex}" placeholder="Ability name..." value="">
                <textarea class="homebrew-input homebrew-ability-input" data-ability-index="${newIndex}" placeholder="Ability description (use {<CAT> type modifier} for CAT formatting)..."></textarea>
                <button type="button" class="btn-icon btn-delete homebrew-remove-ability" data-ability-index="${newIndex}" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
        abilityList.append(newAbilityHtml);

        // Re-bind events for the new elements
        const newItem = abilityList.find(`.ability-item:last`);
        newItem.find('.homebrew-ability-name-input').change(this._onChangeAbilityName.bind(this));
        newItem.find('.homebrew-ability-input').change(this._onChangeAbilityDescription.bind(this));
        newItem.find('.homebrew-remove-ability').click(this._onRemoveAbility.bind(this));

        // Focus the new input
        newItem.find('.homebrew-ability-name-input').focus();
    }

    _onRemoveTask(event) {
        event.preventDefault();
        const taskIndex = parseInt(event.currentTarget.getAttribute('data-task-index'));
        this.agendaOptions.tasks.splice(taskIndex, 1);

        // Remove from DOM and re-index remaining items
        const taskList = this.element.find('.task-list');
        const items = taskList.find('.task-item');
        items.eq(taskIndex).remove();

        // Re-index remaining items
        taskList.find('.task-item').each((index, item) => {
            $(item).find('.homebrew-task-input').attr('data-task-index', index);
            $(item).find('.homebrew-toggle-bold').attr('data-task-index', index);
            $(item).find('.homebrew-remove-task').attr('data-task-index', index);
        });
    }

    _onRemoveAbility(event) {
        event.preventDefault();
        const abilityIndex = parseInt(event.currentTarget.getAttribute('data-ability-index'));
        this.agendaOptions.abilities.splice(abilityIndex, 1);

        // Remove from DOM and re-index remaining items
        const abilityList = this.element.find('.ability-list');
        const items = abilityList.find('.ability-item');
        items.eq(abilityIndex).remove();

        // Re-index remaining items
        abilityList.find('.ability-item').each((index, item) => {
            $(item).find('.homebrew-ability-name-input').attr('data-ability-index', index);
            $(item).find('.homebrew-ability-input').attr('data-ability-index', index);
            $(item).find('.homebrew-remove-ability').attr('data-ability-index', index);
        });
    }

    _onChangeAgendaName(event) {
        event.preventDefault();
        this.agendaOptions.name = event.currentTarget.value;
    }


    _onChangeTaskName(event) {
        event.preventDefault();
        const taskIndex = event.currentTarget.getAttribute('data-task-index');
        this.agendaOptions.tasks[taskIndex].task = event.currentTarget.value;
    }

    _onChangeAbilityName(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        this.agendaOptions.abilities[abilityIndex].name = event.currentTarget.value;
    }

    _onChangeAbilityDescription(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        this.agendaOptions.abilities[abilityIndex].abilityDescription = event.currentTarget.value;
    }

    _onToggleBold(event) {
        event.preventDefault();
        const taskIndex = event.currentTarget.getAttribute('data-task-index');
        this.agendaOptions.tasks[taskIndex].isBold = !this.agendaOptions.tasks[taskIndex].isBold;

        // Update the textarea style and button icon without re-rendering
        const taskList = this.element.find('.task-list');
        const taskItem = taskList.find(`.task-item`).eq(taskIndex);
        const textarea = taskItem.find('.homebrew-task-input');
        const boldIcon = taskItem.find('.homebrew-toggle-bold i');

        if (this.agendaOptions.tasks[taskIndex].isBold) {
            textarea.css('font-weight', 'bold');
            boldIcon.addClass('active');
        } else {
            textarea.css('font-weight', 'normal');
            boldIcon.removeClass('active');
        }
    }

    async _onSubmitAgenda(event) {
        event.preventDefault();

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('agenda');

        let agendaFolderFolder = game.folders.find(f => f.name === "Agendas" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!agendaFolderFolder) {
            agendaFolderFolder = await Folder.create({
                name: "Agendas",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        let agendaFolder = game.folders.find(f => f.name === this.agendaOptions.name && f.type === "Item" && f.folder?.id === agendaFolderFolder.id);
        if (!agendaFolder) {
            agendaFolder = await Folder.create({
                name: this.agendaOptions.name,
                type: "Item",
                folder: agendaFolderFolder.id,
                sorting: "m",
            });
        }

        let agendaTaskFolder = game.folders.find(f => f.name === (this.agendaOptions.name + " Tasks") && f.type === "Item");
        if (!agendaTaskFolder) {
            agendaTaskFolder = await Folder.create({
                name: (this.agendaOptions.name + " Tasks"),
                type: "Item",
                folder: agendaFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let agendaAbilityFolder = game.folders.find(f => f.name === (this.agendaOptions.name + " Abilities") && f.type === "Item");
        if (!agendaAbilityFolder) {
            agendaAbilityFolder = await Folder.create({
                name: this.agendaOptions.name + " Abilities",
                type: "Item",
                folder: agendaFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        const unboldedTaskList = [];
        const boldedTaskList = [];
        const abilityList = [];
        for (const index in this.agendaOptions.tasks) {
            const task = this.agendaOptions.tasks[index];
            const createdTaskData = {
                name: task.task,
                type: "agendaTask", // Ensure this matches the item type defined in your game system
                img: "icons/svg/item-bag.svg",
                folder: agendaTaskFolder.id,  // Assign the item to the folder
                system: {
                    task: task.task,
                    isBold: task.isBold
                }
            };
            const createdTask = await Item.create(createdTaskData);
            if (createdTask.system.isBold) {
                boldedTaskList.push(createdTask.id);
            } else {
                unboldedTaskList.push(createdTask.id);
            }
        }
        for (const index in this.agendaOptions.abilities) {
            const ability = this.agendaOptions.abilities[index];
            const createdAbilityData = {
                name: ability.name,
                type: "agendaAbility", // Ensure this matches the item type defined in your game system
                img: "icons/svg/item-bag.svg",
                folder: agendaAbilityFolder.id,  // Assign the item to the folder
                system: {
                    abilityName: ability.name,
                    abilityDescription: ability.abilityDescription
                }
            };
            const createdAbility = await Item.create(createdAbilityData);
            abilityList.push(createdAbility.id);
            console.log(createdAbility);
        }
        const createdAgendaData = {
            name: this.agendaOptions.name,
            type: "agenda",
            img: "icons/svg/item-bag.svg",
            folder: agendaFolder.id, // Assign the item to the folder
            system: {
                agendaName: this.agendaOptions.name,
                formula: "",
                unboldedTasks: unboldedTaskList,
                boldedTasks: boldedTaskList,
                abilities: abilityList
            }
        };
        console.log(createdAgendaData);
        const createdAgenda = await Item.create(createdAgendaData);
        console.log(createdAgenda);

        // Add to history
        this.addToHistory({
            id: createdAgenda.id,
            name: this.agendaOptions.name,
            type: "agenda",
            icon: "fa-tasks"
        });

        ui.notifications.info(`Agenda "${this.agendaOptions.name}" created successfully!`);
    }

    async _onSubmitAffliction(event) {
        event.preventDefault();

        const afflictionName = document.getElementById('affliction-name').value;
        const afflictionDescription = document.getElementById('affliction-description').value;

        if (!afflictionName || afflictionName.trim() === "") {
            ui.notifications.warn("Please enter an affliction name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('affliction');

        let afflictionFolderFolder = game.folders.find(f => f.name === "Afflictions" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!afflictionFolderFolder) {
            afflictionFolderFolder = await Folder.create({
                name: "Afflictions",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        const createdAfflictionData = {
            name: afflictionName,
            type: "affliction",
            img: "icons/svg/poison.svg",
            folder: afflictionFolderFolder.id,
            system: {
                afflictionName: afflictionName,
                afflictionDescription: afflictionDescription || "Affliction Description",
                formula: ""
            }
        };

        console.log("Creating affliction:", createdAfflictionData);
        const createdAffliction = await Item.create(createdAfflictionData);
        console.log("Created affliction:", createdAffliction);

        // Add to history
        this.addToHistory({
            id: createdAffliction.id,
            name: afflictionName,
            type: "affliction",
            icon: "fa-skull-crossbones"
        });

        ui.notifications.info(`Affliction "${afflictionName}" created successfully!`);

        // Clear the form
        document.getElementById('affliction-name').value = "";
        document.getElementById('affliction-description').value = "";
    }

    async _onSubmitItem(event) {
        event.preventDefault();

        const itemName = document.getElementById('item-name').value;
        const itemDescription = document.getElementById('item-description').value;
        const itemQuantity = parseInt(document.getElementById('item-quantity').value) || 1;
        const itemWeight = parseFloat(document.getElementById('item-weight').value) || 0;

        if (!itemName || itemName.trim() === "") {
            ui.notifications.warn("Please enter an item name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('item');

        let itemFolderFolder = game.folders.find(f => f.name === "Items" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!itemFolderFolder) {
            itemFolderFolder = await Folder.create({
                name: "Items",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        const createdItemData = {
            name: itemName,
            type: "item",
            img: "icons/svg/item-bag.svg",
            folder: itemFolderFolder.id,
            system: {
                description: itemDescription || "",
                quantity: itemQuantity,
                weight: itemWeight,
                roll: {
                    diceNum: 1,
                    diceSize: "d6",
                    diceBonus: ""
                },
                formula: "",
                kitPoint: 0,
                scripValue: 0,
                type: "Aesthetics"
            }
        };

        console.log("Creating item:", createdItemData);
        const createdItem = await Item.create(createdItemData);
        console.log("Created item:", createdItem);

        // Add to history
        this.addToHistory({
            id: createdItem.id,
            name: itemName,
            type: "item",
            icon: "fa-briefcase"
        });

        ui.notifications.info(`Item "${itemName}" created successfully!`);

        // Clear the form
        document.getElementById('item-name').value = "";
        document.getElementById('item-description').value = "";
        document.getElementById('item-quantity').value = "1";
        document.getElementById('item-weight').value = "0";
    }

    async _onSubmitStandalonePower(event) {
        event.preventDefault();

        const powerName = document.getElementById('power-standalone-name').value;
        const isPassive = document.getElementById('power-standalone-passive').checked;
        const psycheBurstCost = document.getElementById('power-standalone-psyche-cost').checked;
        const psycheBurstNoCost = document.getElementById('power-standalone-psyche-no-cost').checked;
        const psycheBurstMultCost = document.getElementById('power-standalone-psyche-mult').checked;
        const keywords = document.getElementById('power-standalone-keywords').value;
        const powerDescription = document.getElementById('power-standalone-description').value;

        if (!powerName || powerName.trim() === "") {
            ui.notifications.warn("Please enter a power name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('blasphemyPower');

        let blasphemyPowersFolder = game.folders.find(f => f.name === "Blasphemy Powers" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!blasphemyPowersFolder) {
            blasphemyPowersFolder = await Folder.create({
                name: "Blasphemy Powers",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [];

        const createdPowerData = {
            name: powerName,
            type: "blasphemyPower",
            img: "icons/svg/lightning.svg",
            folder: blasphemyPowersFolder.id,
            system: {
                blasphemyType: "Standalone",
                powerName: powerName,
                isPassive: isPassive,
                keywords: keywordsArray,
                powerDescription: powerDescription || "Power Description",
                psycheBurstCost: psycheBurstCost,
                psycheBurstNoCost: psycheBurstNoCost,
                psycheBurstMultCost: psycheBurstMultCost
            }
        };

        console.log("Creating standalone power:", createdPowerData);
        const createdPower = await Item.create(createdPowerData);
        console.log("Created power:", createdPower);

        // Add to history
        this.addToHistory({
            id: createdPower.id,
            name: powerName,
            type: "blasphemyPower",
            icon: "fa-hand-sparkles"
        });

        ui.notifications.info(`Power "${powerName}" created successfully!`);

        // Clear the form
        document.getElementById('power-standalone-name').value = "";
        document.getElementById('power-standalone-passive').checked = false;
        document.getElementById('power-standalone-psyche-cost').checked = false;
        document.getElementById('power-standalone-psyche-no-cost').checked = false;
        document.getElementById('power-standalone-psyche-mult').checked = false;
        document.getElementById('power-standalone-keywords').value = "";
        document.getElementById('power-standalone-description').value = "";
    }

    _onCreateNewSinMarkAbility(event) {
        event.preventDefault();
        const newIndex = this.sinMarkOptions.abilities.length;
        this.sinMarkOptions.abilities.push({
            name: "",
            abilityDescription: ""
        });

        // Add new ability to DOM without re-rendering
        const abilityList = this.element.find('[data-tab="sinMark"] .ability-list');
        const newAbilityHtml = `
            <li class='ability-item'>
                <input type="text" class="homebrew-input homebrew-sinmark-ability-name-input" data-sinmark-ability-index="${newIndex}" placeholder="Ability name..." value="">
                <textarea class="homebrew-input homebrew-sinmark-ability-description-input" data-sinmark-ability-index="${newIndex}" placeholder="Ability description (use {<CAT> type modifier} for CAT formatting)..."></textarea>
                <button type="button" class="btn-icon btn-delete homebrew-remove-sinmark-ability" data-sinmark-ability-index="${newIndex}" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
        abilityList.append(newAbilityHtml);

        // Re-bind events for the new elements
        const newItem = abilityList.find(`.ability-item:last`);
        newItem.find('.homebrew-sinmark-ability-name-input').change(this._onChangeSinMarkAbilityName.bind(this));
        newItem.find('.homebrew-sinmark-ability-description-input').change(this._onChangeSinMarkAbilityDescription.bind(this));
        newItem.find('.homebrew-remove-sinmark-ability').click(this._onRemoveSinMarkAbility.bind(this));

        // Focus the new input
        newItem.find('.homebrew-sinmark-ability-name-input').focus();
    }

    _onRemoveSinMarkAbility(event) {
        event.preventDefault();
        const abilityIndex = parseInt(event.currentTarget.getAttribute('data-sinmark-ability-index'));
        this.sinMarkOptions.abilities.splice(abilityIndex, 1);

        // Remove from DOM and re-index remaining items
        const abilityList = this.element.find('[data-tab="sinMark"] .ability-list');
        const items = abilityList.find('.ability-item');
        items.eq(abilityIndex).remove();

        // Re-index remaining items
        abilityList.find('.ability-item').each((index, item) => {
            $(item).find('.homebrew-sinmark-ability-name-input').attr('data-sinmark-ability-index', index);
            $(item).find('.homebrew-sinmark-ability-description-input').attr('data-sinmark-ability-index', index);
            $(item).find('.homebrew-remove-sinmark-ability').attr('data-sinmark-ability-index', index);
        });
    }

    _onChangeSinMarkAbilityName(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-sinmark-ability-index');
        this.sinMarkOptions.abilities[abilityIndex].name = event.currentTarget.value;
        // No render needed - just update the data
    }

    _onChangeSinMarkAbilityDescription(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-sinmark-ability-index');
        this.sinMarkOptions.abilities[abilityIndex].abilityDescription = event.currentTarget.value;
        // No render needed - just update the data
    }

    async _onSubmitSinMark(event) {
        event.preventDefault();

        const sinMarkName = document.getElementById('sinmark-name').value;
        const sinMarkDescription = document.getElementById('sinmark-description').value;

        if (!sinMarkName || sinMarkName.trim() === "") {
            ui.notifications.warn("Please enter a sin mark name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('sinMark');

        let sinMarkFolderFolder = game.folders.find(f => f.name === "Sin Marks" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!sinMarkFolderFolder) {
            sinMarkFolderFolder = await Folder.create({
                name: "Sin Marks",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        let sinMarkFolder = game.folders.find(f => f.name === sinMarkName && f.type === "Item" && f.folder?.id === sinMarkFolderFolder.id);
        if (!sinMarkFolder) {
            sinMarkFolder = await Folder.create({
                name: sinMarkName,
                type: "Item",
                folder: sinMarkFolderFolder.id,
                sorting: "m",
            });
        }

        let sinMarkAbilityFolder = game.folders.find(f => f.name === (sinMarkName + " Abilities") && f.type === "Item");
        if (!sinMarkAbilityFolder) {
            sinMarkAbilityFolder = await Folder.create({
                name: sinMarkName + " Abilities",
                type: "Item",
                folder: sinMarkFolder.id,
                sorting: "m",
            });
        }

        const abilityList = [];
        for (const index in this.sinMarkOptions.abilities) {
            const ability = this.sinMarkOptions.abilities[index];
            const createdAbilityData = {
                name: ability.name,
                type: "sinMarkAbility",
                img: "icons/svg/item-bag.svg",
                folder: sinMarkAbilityFolder.id,
                system: {
                    abilityName: ability.name,
                    abilityDescription: ability.abilityDescription,
                    bodyPartName: sinMarkName,
                    formula: ""
                }
            };
            const createdAbility = await Item.create(createdAbilityData);
            abilityList.push(createdAbility.id);
            console.log(createdAbility);
        }

        const createdSinMarkData = {
            name: sinMarkName,
            type: "sinMark",
            img: "icons/svg/item-bag.svg",
            folder: sinMarkFolder.id,
            system: {
                bodyPartName: sinMarkName,
                markAmount: 0,
                abilities: abilityList,
                description: sinMarkDescription || ""
            }
        };

        console.log("Creating sin mark:", createdSinMarkData);
        const createdSinMark = await Item.create(createdSinMarkData);
        console.log("Created sin mark:", createdSinMark);

        // Add to history
        this.addToHistory({
            id: createdSinMark.id,
            name: sinMarkName,
            type: "sinMark",
            icon: "fa-exclamation-triangle"
        });

        ui.notifications.info(`Sin Mark "${sinMarkName}" created successfully!`);

        // Clear the form
        document.getElementById('sinmark-name').value = "";
        document.getElementById('sinmark-description').value = "";

        // Reset abilities to defaults
        this.sinMarkOptions.abilities = [
            {
                name: "Ability 1",
                abilityDescription: "Ability Description"
            },
            {
                name: "Ability 2",
                abilityDescription: "Ability Description"
            }
        ];
        this.render(true);
    }

    // ==================== BOND METHODS ====================

    _onCreateNewStricture(event) {
        event.preventDefault();
        const newIndex = this.bondOptions.strictures.length;
        this.bondOptions.strictures.push("");

        // Add new stricture to DOM without re-rendering
        const strictureList = this.element.find('#bond-stricture-list');
        const emptyState = strictureList.find('.stricture-empty-state');
        if (emptyState.length) {
            emptyState.remove();
        }

        const newStrictureHtml = `
            <li class='stricture-item'>
                <span class="stricture-number"></span>
                <textarea class="homebrew-input homebrew-stricture-input" data-stricture-index="${newIndex}" placeholder="Enter stricture (e.g., 'Never lie', 'Always help the innocent')..."></textarea>
                <button type="button" class="btn-icon btn-delete homebrew-remove-stricture" data-stricture-index="${newIndex}" title="Remove Stricture">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
        strictureList.append(newStrictureHtml);

        // Re-bind events for the new elements
        const newItem = strictureList.find(`.stricture-item:last`);
        newItem.find('.homebrew-stricture-input').change(this._onChangeStricture.bind(this));
        newItem.find('.homebrew-remove-stricture').click(this._onRemoveStricture.bind(this));

        // Focus the new textarea
        newItem.find('.homebrew-stricture-input').focus();
    }

    _onChangeStricture(event) {
        event.preventDefault();
        const strictureIndex = event.currentTarget.getAttribute('data-stricture-index');
        this.bondOptions.strictures[strictureIndex] = event.currentTarget.value;
    }

    _onRemoveStricture(event) {
        event.preventDefault();
        const strictureIndex = parseInt(event.currentTarget.getAttribute('data-stricture-index'));
        this.bondOptions.strictures.splice(strictureIndex, 1);

        // Remove from DOM and re-index remaining items
        const strictureList = this.element.find('#bond-stricture-list');
        const items = strictureList.find('.stricture-item');
        items.eq(strictureIndex).remove();

        // Re-index remaining items
        strictureList.find('.stricture-item').each((index, item) => {
            $(item).find('.homebrew-stricture-input').attr('data-stricture-index', index);
            $(item).find('.homebrew-remove-stricture').attr('data-stricture-index', index);
        });

        // Show empty state if no strictures left
        if (this.bondOptions.strictures.length === 0) {
            const emptyHtml = `
                <li class="stricture-empty-state">
                    <i class="fas fa-scroll"></i>
                    <span>No strictures added yet. Click "Add Stricture" to define the rules of this bond.</span>
                </li>
            `;
            strictureList.append(emptyHtml);
        }
    }

    async _onSubmitBond(event) {
        event.preventDefault();

        const bondName = document.getElementById('bond-name').value;
        const virtueName = document.getElementById('bond-virtue-name').value;
        const highBlasphemyLevel = parseInt(document.getElementById('bond-high-blasphemy-level').value) || 1;

        if (!bondName || bondName.trim() === "") {
            ui.notifications.warn("Please enter a bond name.");
            return;
        }

        if (!virtueName || virtueName.trim() === "") {
            ui.notifications.warn("Please enter a virtue name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('bond');

        let bondFolderFolder = game.folders.find(f => f.name === "Bonds" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!bondFolderFolder) {
            bondFolderFolder = await Folder.create({
                name: "Bonds",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        // Collect strictures from the textarea inputs
        const strictureInputs = document.querySelectorAll('.homebrew-stricture-input');
        const strictures = [];
        strictureInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                strictures.push(value);
            }
        });

        const createdBondData = {
            name: bondName,
            type: "bond",
            img: "icons/svg/heart.svg",
            folder: bondFolderFolder.id,
            system: {
                virtueName: virtueName,
                strictures: strictures,
                abilities: [],
                highBlasphemy: "",
                highBlasphemyLevel: highBlasphemyLevel
            }
        };

        console.log("Creating bond:", createdBondData);
        const createdBond = await Item.create(createdBondData);
        console.log("Created bond:", createdBond);

        // Add to history
        this.addToHistory({
            id: createdBond.id,
            name: bondName,
            type: "bond",
            icon: "fa-heart"
        });

        ui.notifications.info(`Bond "${bondName}" created successfully!`);

        // Clear the form
        document.getElementById('bond-name').value = "";
        document.getElementById('bond-virtue-name').value = "";
        document.getElementById('bond-high-blasphemy-level').value = "1";

        // Reset strictures
        this.bondOptions.strictures = [];
        this.render(true);
    }

    // ==================== BOND ABILITY METHODS ====================

    _onTogglePsycheCost(event) {
        const isChecked = event.currentTarget.checked;
        const psycheCostField = document.getElementById('bond-ability-psyche-cost-field');
        if (psycheCostField) {
            psycheCostField.style.display = isChecked ? 'block' : 'none';
        }
    }

    async _onSubmitBondAbility(event) {
        event.preventDefault();

        const abilityName = document.getElementById('bond-ability-name').value;
        const bondLevel = parseInt(document.getElementById('bond-ability-level').value) || 0;
        const abilityDescription = document.getElementById('bond-ability-description').value;
        const isPermanent = document.getElementById('bond-ability-permanent').checked;
        const requiresPsycheBurst = document.getElementById('bond-ability-requires-psyche').checked;
        const psycheBurstCost = parseInt(document.getElementById('bond-ability-psyche-cost').value) || 0;

        if (!abilityName || abilityName.trim() === "") {
            ui.notifications.warn("Please enter an ability name.");
            return;
        }

        // Get target folder based on settings
        const targetFolder = await this._getTargetFolder('bondAbility');

        let bondAbilityFolderFolder = game.folders.find(f => f.name === "Bond Abilities" && f.type === "Item" && f.folder?.id === targetFolder.id);
        if (!bondAbilityFolderFolder) {
            bondAbilityFolderFolder = await Folder.create({
                name: "Bond Abilities",
                type: "Item",
                folder: targetFolder.id,
                sorting: "m",
            });
        }

        const createdBondAbilityData = {
            name: abilityName,
            type: "bondAbility",
            img: "icons/svg/aura.svg",
            folder: bondAbilityFolderFolder.id,
            system: {
                bondLevel: bondLevel,
                abilityDescription: abilityDescription || "",
                isPermanent: isPermanent,
                requiresPsycheBurst: requiresPsycheBurst,
                psycheBurstCost: requiresPsycheBurst ? psycheBurstCost : 0
            }
        };

        console.log("Creating bond ability:", createdBondAbilityData);
        const createdBondAbility = await Item.create(createdBondAbilityData);
        console.log("Created bond ability:", createdBondAbility);

        // Add to history
        this.addToHistory({
            id: createdBondAbility.id,
            name: abilityName,
            type: "bondAbility",
            icon: "fa-handshake"
        });

        ui.notifications.info(`Bond Ability "${abilityName}" created successfully!`);

        // Clear the form
        document.getElementById('bond-ability-name').value = "";
        document.getElementById('bond-ability-level').value = "0";
        document.getElementById('bond-ability-description').value = "";
        document.getElementById('bond-ability-permanent').checked = true;
        document.getElementById('bond-ability-requires-psyche').checked = false;
        document.getElementById('bond-ability-psyche-cost').value = "1";
        document.getElementById('bond-ability-psyche-cost-field').style.display = 'none';
    }

    // ==================== IMPORT/EXPORT METHODS ====================

    _populateExportList(html) {
        const exportList = html.find('#export-items-list');
        if (!exportList.length) return;

        const homebrewItems = this._getHomebrewItems();

        if (homebrewItems.length === 0) {
            exportList.html('<p class="empty-state"><i class="fas fa-inbox"></i> No items to export.</p>');
            return;
        }

        let listHTML = '';
        homebrewItems.forEach((item, index) => {
            const iconClass = this._getIconForType(item.type);
            listHTML += `
                <label class="checkbox-label">
                    <input type="checkbox" class="export-item-checkbox" data-item-id="${item.id}" data-item-index="${index}">
                    <span><i class="fas ${iconClass}"></i> ${item.name} <em>(${this._getTypeLabel(item.type)})</em></span>
                </label>
            `;
        });

        exportList.html(listHTML);
    }

    _getHomebrewItems() {
        const items = [];
        const itemsSet = new Set();

        // Get all items from history
        const historyItemIds = this.history.map(h => h.id);

        // Method 1: Get items from history
        for (const itemId of historyItemIds) {
            const item = game.items.get(itemId);
            if (item && !itemsSet.has(item.id)) {
                items.push(item);
                itemsSet.add(item.id);
            }
        }

        // Method 2: Get items from Homebrew folder and its subfolders
        const homebrewFolders = game.folders.filter(f =>
            f.type === "Item" &&
            (f.name === "Homebrew" || f.folder?.name === "Homebrew" || f.folder?.folder?.name === "Homebrew")
        );

        for (const folder of homebrewFolders) {
            for (const item of game.items.filter(i => i.folder?.id === folder.id)) {
                if (["agenda", "blasphemy", "blasphemyPower", "bond", "bondAbility", "affliction", "item", "sinMark"].includes(item.type) && !itemsSet.has(item.id)) {
                    items.push(item);
                    itemsSet.add(item.id);
                }
            }
        }

        return items;
    }

    _getIconForType(type) {
        const icons = {
            "agenda": "fa-tasks",
            "blasphemy": "fa-book-dead",
            "blasphemyPower": "fa-hand-sparkles",
            "bond": "fa-heart",
            "bondAbility": "fa-handshake",
            "affliction": "fa-skull-crossbones",
            "item": "fa-briefcase",
            "sinMark": "fa-exclamation-triangle"
        };
        return icons[type] || "fa-file";
    }

    _getTypeLabel(type) {
        const labels = {
            "agenda": "Agenda",
            "blasphemy": "Blasphemy",
            "blasphemyPower": "Power",
            "bond": "Bond",
            "bondAbility": "Bond Ability",
            "affliction": "Affliction",
            "item": "Item",
            "sinMark": "Sin Mark"
        };
        return labels[type] || type;
    }

    _onToggleSelectAll(event) {
        const isChecked = event.currentTarget.checked;
        const checkboxes = this.element.find('.export-item-checkbox');
        checkboxes.prop('checked', isChecked);
    }

    async _onExportSelected(event) {
        event.preventDefault();

        const checkedBoxes = this.element.find('.export-item-checkbox:checked');
        if (checkedBoxes.length === 0) {
            ui.notifications.warn("Please select at least one item to export.");
            return;
        }

        const itemIds = [];
        checkedBoxes.each(function() {
            itemIds.push($(this).data('item-id'));
        });

        const items = game.items.filter(i => itemIds.includes(i.id));
        await this._exportItems(items);
    }

    async _onExportAll(event) {
        event.preventDefault();

        const items = this._getHomebrewItems();
        if (items.length === 0) {
            ui.notifications.warn("No homebrew items to export.");
            return;
        }

        await this._exportItems(items);
    }

    async _exportItems(items) {
        const exportData = {
            system: "cain",
            version: game.system.version,
            exportDate: new Date().toISOString(),
            items: []
        };

        for (const item of items) {
            const itemData = item.toObject();
            exportData.items.push(itemData);
        }

        const filename = `cain-homebrew-${new Date().toISOString().split('T')[0]}.json`;
        const json = JSON.stringify(exportData, null, 2);

        saveDataToFile(json, "application/json", filename);

        ui.notifications.info(`Exported ${items.length} item(s) to ${filename}`);
    }

    _onChooseFile(event) {
        event.preventDefault();
        this.element.find('#homebrew-import-file').click();
    }

    async _onFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.element.find('#selected-file-name').html(`<i class="fas fa-file"></i> ${file.name}`);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                this._pendingImport = json;

                if (!json.items || !Array.isArray(json.items)) {
                    throw new Error("Invalid file format");
                }

                const previewContent = this.element.find('#import-preview-content');
                let previewHTML = `<p><strong>Found ${json.items.length} item(s):</strong></p><ul>`;

                for (const item of json.items) {
                    const iconClass = this._getIconForType(item.type);
                    previewHTML += `<li><i class="fas ${iconClass}"></i> ${item.name} <em>(${this._getTypeLabel(item.type)})</em></li>`;
                }
                previewHTML += '</ul>';

                previewContent.html(previewHTML);
                this.element.find('#import-preview').show();

            } catch (error) {
                ui.notifications.error("Failed to read import file: " + error.message);
                console.error(error);
            }
        };

        reader.readAsText(file);
    }

    async _onConfirmImport(event) {
        event.preventDefault();

        if (!this._pendingImport) {
            ui.notifications.warn("No file selected for import.");
            return;
        }

        try {
            const importData = this._pendingImport;
            let importedCount = 0;

            // Get selected folder or use default
            const selectedFolderId = this.element.find('#import-target-folder').val();
            let targetFolder;

            if (selectedFolderId) {
                targetFolder = game.folders.get(selectedFolderId);
            } else {
                // Use the settings default or Homebrew folder
                if (this.settings.importFolder) {
                    targetFolder = game.folders.get(this.settings.importFolder);
                }
                if (!targetFolder) {
                    targetFolder = await this._getOrCreateHomebrewFolder();
                }
            }

            for (const itemData of importData.items) {
                // Check if item already exists
                const existing = game.items.find(i => i.name === itemData.name && i.type === itemData.type);
                if (existing) {
                    console.warn(`Item "${itemData.name}" already exists, skipping.`);
                    continue;
                }

                // Get appropriate folder for this item type within target folder
                const itemTypeFolder = await this._getOrCreateItemTypeFolder(itemData.type, targetFolder);

                // Update itemData to use the correct folder
                itemData.folder = itemTypeFolder.id;

                // Create the item
                await Item.create(itemData);
                importedCount++;

                // Add to history
                this.addToHistory({
                    id: itemData._id,
                    name: itemData.name,
                    type: itemData.type,
                    icon: this._getIconForType(itemData.type)
                });
            }

            ui.notifications.info(`Successfully imported ${importedCount} item(s).`);

            // Clear the import state
            this._pendingImport = null;
            this.element.find('#import-preview').hide();
            this.element.find('#homebrew-import-file').val('');
            this.element.find('#selected-file-name').html('<i class="fas fa-file"></i> No file selected');

            // Refresh the display
            this.render(true);

        } catch (error) {
            ui.notifications.error("Failed to import items: " + error.message);
            console.error(error);
        }
    }

    // ==================== HISTORY METHODS ====================

    _populateHistory(html) {
        const historyList = html.find('#history-list');
        if (!historyList.length) return;

        const filter = html.find('#history-filter').val() || 'all';
        let filteredHistory = this.history;

        if (filter !== 'all') {
            filteredHistory = this.history.filter(item => item.type === filter);
        }

        if (filteredHistory.length === 0) {
            historyList.html('<p class="empty-state"><i class="fas fa-inbox"></i> No items created yet. Start creating homebrew content!</p>');
            return;
        }

        let historyHTML = '<div class="history-items">';

        for (const item of filteredHistory) {
            const iconClass = this._getIconForType(item.type);
            const typeLabel = this._getTypeLabel(item.type);

            historyHTML += `
                <div class="history-item" data-item-id="${item.id}">
                    <div class="history-item-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="history-item-info">
                        <div class="history-item-name">${item.name}</div>
                        <div class="history-item-meta">
                            <span class="history-item-type">${typeLabel}</span>
                            <span class="history-item-date">${item.date}</span>
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button type="button" class="btn-icon history-view-item" data-item-id="${item.id}" title="View Item">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn-icon history-delete-item" data-item-id="${item.id}" title="Delete from History">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        historyHTML += '</div>';
        historyList.html(historyHTML);

        // Add click handlers for history items
        html.find('.history-view-item').click(this._onViewHistoryItem.bind(this));
        html.find('.history-delete-item').click(this._onDeleteHistoryItem.bind(this));
    }

    _onFilterHistory(event) {
        this._populateHistory(this.element);
    }

    async _onViewHistoryItem(event) {
        event.preventDefault();
        const itemId = $(event.currentTarget).data('item-id');
        const item = game.items.get(itemId);

        if (item) {
            item.sheet.render(true);
        } else {
            ui.notifications.warn("Item no longer exists in the world.");
        }
    }

    async _onDeleteHistoryItem(event) {
        event.preventDefault();
        const itemId = $(event.currentTarget).data('item-id');

        this.history = this.history.filter(item => item.id !== itemId);
        this.saveHistory();
        this._populateHistory(this.element);

        ui.notifications.info("Item removed from history.");
    }

    async _onClearHistory(event) {
        event.preventDefault();

        const confirmed = await Dialog.confirm({
            title: "Clear History",
            content: "<p>Are you sure you want to clear the entire creation history? This cannot be undone.</p>",
            yes: () => true,
            no: () => false
        });

        if (confirmed) {
            this.history = [];
            this.saveHistory();
            this._populateHistory(this.element);
            ui.notifications.info("History cleared.");
        }
    }

    // ==================== SETTINGS METHODS ====================

    async _getOrCreateHomebrewFolder(parentFolderId = null) {
        // Find existing Homebrew folder - for root level folders, folder is null
        let homebrewFolder;
        if (parentFolderId === null) {
            // Looking for root-level Homebrew folder
            homebrewFolder = game.folders.find(f => f.name === "Homebrew" && f.type === "Item" && !f.folder);
        } else {
            homebrewFolder = game.folders.find(f => f.name === "Homebrew" && f.type === "Item" && f.folder?.id === parentFolderId);
        }

        if (!homebrewFolder) {
            homebrewFolder = await Folder.create({
                name: "Homebrew",
                type: "Item",
                folder: parentFolderId,
                sorting: "m",
            });
        }

        return homebrewFolder;
    }

    async _getOrCreateItemTypeFolder(itemType, parentFolder) {
        const folderNames = {
            'agenda': 'Agendas',
            'blasphemy': 'Blasphemies',
            'blasphemyPower': 'Blasphemy Powers',
            'bond': 'Bonds',
            'bondAbility': 'Bond Abilities',
            'affliction': 'Afflictions',
            'item': 'Items',
            'sinMark': 'Sin Marks'
        };

        const folderName = folderNames[itemType] || 'Other';
        let typeFolder = game.folders.find(f => f.name === folderName && f.type === "Item" && f.folder?.id === parentFolder.id);

        if (!typeFolder) {
            typeFolder = await Folder.create({
                name: folderName,
                type: "Item",
                folder: parentFolder.id,
                sorting: "m",
            });
        }

        return typeFolder;
    }

    async _getTargetFolder(itemType) {
        const folderMap = {
            'agenda': this.settings.agendaFolder,
            'blasphemy': this.settings.blasphemyFolder,
            'blasphemyPower': this.settings.powerFolder,
            'bond': this.settings.bondFolder,
            'bondAbility': this.settings.bondAbilityFolder,
            'affliction': this.settings.afflictionFolder,
            'item': this.settings.itemFolder,
            'sinMark': this.settings.sinMarkFolder
        };

        const savedFolderId = folderMap[itemType];

        if (savedFolderId) {
            const folder = game.folders.get(savedFolderId);
            if (folder) return folder;
        }

        // Default to Homebrew folder
        return await this._getOrCreateHomebrewFolder();
    }

    _onChangeFolderSetting(event) {
        const select = event.currentTarget;
        const itemType = select.dataset.itemType;
        const folderId = select.value;

        const settingMap = {
            'agenda': 'agendaFolder',
            'blasphemy': 'blasphemyFolder',
            'blasphemyPower': 'powerFolder',
            'affliction': 'afflictionFolder',
            'item': 'itemFolder',
            'sinMark': 'sinMarkFolder',
            'import': 'importFolder'
        };

        const settingKey = settingMap[itemType];
        if (settingKey) {
            this.settings[settingKey] = folderId;
        }
    }

    async _onSaveSettings(event) {
        event.preventDefault();
        this.saveSettings();
        ui.notifications.info("Homebrew settings saved successfully!");
    }

    async _onResetSettings(event) {
        event.preventDefault();

        const confirmed = await Dialog.confirm({
            title: "Reset Settings",
            content: "<p>Are you sure you want to reset all folder settings to defaults?</p>",
            yes: () => true,
            no: () => false
        });

        if (confirmed) {
            this.settings = {
                agendaFolder: '',
                blasphemyFolder: '',
                powerFolder: '',
                bondFolder: '',
                bondAbilityFolder: '',
                afflictionFolder: '',
                itemFolder: '',
                sinMarkFolder: '',
                importFolder: ''
            };
            this.saveSettings();
            this.render(true);
            ui.notifications.info("Settings reset to defaults.");
        }
    }

    // ==================== REVERSE IMPORT METHODS ====================

    _onReverseImportTypeChange(event) {
        const selectedType = event.currentTarget.value;
        const itemSelect = this.element.find('#reverse-import-item');
        const loadButton = this.element.find('.homebrew-load-item');

        if (!selectedType) {
            itemSelect.html('<option value="">-- Select Type First --</option>');
            itemSelect.prop('disabled', true);
            loadButton.prop('disabled', true);
            return;
        }

        // Get all items of the selected type
        const items = game.items.filter(i => i.type === selectedType);

        if (items.length === 0) {
            itemSelect.html('<option value="">No items of this type found</option>');
            itemSelect.prop('disabled', true);
            loadButton.prop('disabled', true);
            return;
        }

        // Sort by name
        items.sort((a, b) => a.name.localeCompare(b.name));

        // Build options HTML
        let optionsHtml = '<option value="">-- Select Item --</option>';
        for (const item of items) {
            optionsHtml += `<option value="${item.id}">${item.name}</option>`;
        }

        itemSelect.html(optionsHtml);
        itemSelect.prop('disabled', false);
        loadButton.prop('disabled', true);
    }

    _onReverseImportItemChange(event) {
        const selectedItem = event.currentTarget.value;
        const loadButton = this.element.find('.homebrew-load-item');
        loadButton.prop('disabled', !selectedItem);
    }

    async _onLoadItemForEditing(event) {
        event.preventDefault();

        const selectedType = this.element.find('#reverse-import-type').val();
        const selectedItemId = this.element.find('#reverse-import-item').val();

        if (!selectedType || !selectedItemId) {
            ui.notifications.warn("Please select an item type and item to load.");
            return;
        }

        const item = game.items.get(selectedItemId);
        if (!item) {
            ui.notifications.error("Item not found.");
            return;
        }

        // Load data into the appropriate form based on type
        switch (selectedType) {
            case 'agenda':
                await this._loadAgendaForEditing(item);
                break;
            case 'blasphemy':
                await this._loadBlasphemyForEditing(item);
                break;
            case 'blasphemyPower':
                this._loadStandalonePowerForEditing(item);
                break;
            case 'bond':
                this._loadBondForEditing(item);
                break;
            case 'bondAbility':
                this._loadBondAbilityForEditing(item);
                break;
            case 'affliction':
                this._loadAfflictionForEditing(item);
                break;
            case 'item':
                this._loadItemForEditing(item);
                break;
            case 'sinMark':
                await this._loadSinMarkForEditing(item);
                break;
            default:
                ui.notifications.error("Unknown item type.");
                return;
        }

        ui.notifications.info(`Loaded "${item.name}" for editing. Switch to the appropriate tab to modify it.`);
    }

    async _loadAgendaForEditing(item) {
        // Load tasks
        const tasks = [];
        const unboldedTaskIds = item.system.unboldedTasks || [];
        const boldedTaskIds = item.system.boldedTasks || [];

        for (const taskId of unboldedTaskIds) {
            const taskItem = game.items.get(taskId);
            if (taskItem) {
                tasks.push({ task: taskItem.system.task || taskItem.name, isBold: false });
            }
        }
        for (const taskId of boldedTaskIds) {
            const taskItem = game.items.get(taskId);
            if (taskItem) {
                tasks.push({ task: taskItem.system.task || taskItem.name, isBold: true });
            }
        }

        // Load abilities
        const abilities = [];
        const abilityIds = item.system.abilities || [];
        for (const abilityId of abilityIds) {
            const abilityItem = game.items.get(abilityId);
            if (abilityItem) {
                abilities.push({
                    name: abilityItem.name,
                    abilityDescription: abilityItem.system.abilityDescription || ''
                });
            }
        }

        this.agendaOptions = {
            name: item.name,
            tasks: tasks.length > 0 ? tasks : [{ task: "", isBold: false }],
            abilities: abilities.length > 0 ? abilities : [{ name: "", abilityDescription: "" }]
        };

        // Store reference to original item for potential update
        this._editingItem = item;
        this._editingItemType = 'agenda';

        this.render(true);

        // Switch to agenda tab after render
        setTimeout(() => {
            this.element.find('.sheet-tabs .item[data-tab="agenda"]').click();
        }, 100);
    }

    async _loadBlasphemyForEditing(item) {
        // Load powers
        const powers = [];
        const powerIds = item.system.powers || [];

        for (const powerId of powerIds) {
            const powerItem = game.items.get(powerId);
            if (powerItem) {
                powers.push({
                    name: powerItem.name,
                    isPassive: powerItem.system.isPassive || false,
                    keywords: powerItem.system.keywords || '',
                    powerDescription: powerItem.system.powerDescription || '',
                    psycheBurstCost: powerItem.system.psycheBurstCost || false,
                    psycheBurstNoCost: powerItem.system.psycheBurstNoCost || false,
                    psycheBurstMultCost: powerItem.system.psycheBurstMultCost || false
                });
            }
        }

        this.blasphemyOptions = {
            name: item.name,
            powers: powers.length > 0 ? powers : [{
                name: "",
                isPassive: false,
                keywords: "",
                powerDescription: "",
                psycheBurstCost: false,
                psycheBurstNoCost: false,
                psycheBurstMultCost: false
            }]
        };

        this._editingItem = item;
        this._editingItemType = 'blasphemy';

        this.render(true);

        setTimeout(() => {
            this.element.find('.sheet-tabs .item[data-tab="blasphemy"]').click();
        }, 100);
    }

    _loadStandalonePowerForEditing(item) {
        // Populate the standalone power form
        setTimeout(() => {
            const doc = document;
            doc.getElementById('power-standalone-name').value = item.name || '';
            doc.getElementById('power-standalone-passive').checked = item.system.isPassive || false;
            doc.getElementById('power-standalone-psyche-cost').checked = item.system.psycheBurstCost || false;
            doc.getElementById('power-standalone-psyche-no-cost').checked = item.system.psycheBurstNoCost || false;
            doc.getElementById('power-standalone-psyche-mult').checked = item.system.psycheBurstMultCost || false;
            doc.getElementById('power-standalone-keywords').value = Array.isArray(item.system.keywords) ? item.system.keywords.join(', ') : (item.system.keywords || '');
            doc.getElementById('power-standalone-description').value = item.system.powerDescription || '';

            this.element.find('.sheet-tabs .item[data-tab="blasphemy"]').click();
        }, 100);
    }

    _loadBondForEditing(item) {
        this.bondOptions = {
            name: item.name,
            virtueName: item.system.virtueName || '',
            highBlasphemyLevel: item.system.highBlasphemyLevel || 1,
            strictures: item.system.strictures || []
        };

        this._editingItem = item;
        this._editingItemType = 'bond';

        this.render(true);

        setTimeout(() => {
            this.element.find('.sheet-tabs .item[data-tab="bond"]').click();
        }, 100);
    }

    _loadBondAbilityForEditing(item) {
        setTimeout(() => {
            const doc = document;
            doc.getElementById('bond-ability-name').value = item.name || '';
            doc.getElementById('bond-ability-level').value = item.system.bondLevel || 0;
            doc.getElementById('bond-ability-description').value = item.system.abilityDescription || '';
            doc.getElementById('bond-ability-permanent').checked = item.system.isPermanent !== false;
            doc.getElementById('bond-ability-requires-psyche').checked = item.system.requiresPsycheBurst || false;
            doc.getElementById('bond-ability-psyche-cost').value = item.system.psycheBurstCost || 1;

            // Toggle psyche cost field visibility
            const psycheCostField = doc.getElementById('bond-ability-psyche-cost-field');
            if (psycheCostField) {
                psycheCostField.style.display = item.system.requiresPsycheBurst ? 'block' : 'none';
            }

            this.element.find('.sheet-tabs .item[data-tab="bond"]').click();
        }, 100);
    }

    _loadAfflictionForEditing(item) {
        setTimeout(() => {
            const doc = document;
            doc.getElementById('affliction-name').value = item.name || '';
            doc.getElementById('affliction-description').value = item.system.afflictionDescription || '';

            this.element.find('.sheet-tabs .item[data-tab="affliction"]').click();
        }, 100);
    }

    _loadItemForEditing(item) {
        setTimeout(() => {
            const doc = document;
            doc.getElementById('item-name').value = item.name || '';
            doc.getElementById('item-description').value = item.system.description || '';
            doc.getElementById('item-quantity').value = item.system.quantity || 1;
            doc.getElementById('item-weight').value = item.system.weight || 0;

            this.element.find('.sheet-tabs .item[data-tab="item"]').click();
        }, 100);
    }

    async _loadSinMarkForEditing(item) {
        // Load abilities
        const abilities = [];
        const abilityIds = item.system.abilities || [];

        for (const abilityId of abilityIds) {
            const abilityItem = game.items.get(abilityId);
            if (abilityItem) {
                abilities.push({
                    name: abilityItem.name,
                    abilityDescription: abilityItem.system.abilityDescription || ''
                });
            }
        }

        this.sinMarkOptions = {
            name: item.name,
            description: item.system.description || '',
            abilities: abilities.length > 0 ? abilities : [{ name: "", abilityDescription: "" }]
        };

        this._editingItem = item;
        this._editingItemType = 'sinMark';

        this.render(true);

        setTimeout(() => {
            // Populate the name and description fields
            const doc = document;
            doc.getElementById('sinmark-name').value = item.name || '';
            doc.getElementById('sinmark-description').value = item.system.description || '';

            this.element.find('.sheet-tabs .item[data-tab="sinMark"]').click();
        }, 100);
    }
}
