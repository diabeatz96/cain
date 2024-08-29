import { CainAgenda, CainAgendaTask, CainAgendaAbility } from "../data/_module.mjs";
import { CainBlasphemy, CainBlasphemyPower } from "../data/_module.mjs";

export class HomebrewWindow extends Application {
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

    blasphemyOptions = {
        name: "New Blasphemy",
        powers: [{
            name: "Power 1",
            isPassive: true,
            keywords: "default",
            powerDescription: "Power Description"
        },
        {
            name: "Power 2",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
        },
        {
            name: "Power 3",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
        },        
        {
            name: "Power 4",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
        },        
        {
            name: "Power 5",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
        },        
        {
            name: "Power 6",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
        },        
        {
            name: "Power 7",
            isPassive: false,
            keywords: "default",
            powerDescription: "Power Description"
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
        return {
            agendaOptions: this.agendaOptions,
            blasphemyOptions: this.blasphemyOptions
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
      html.find('.homebrew-power-tags-input').change(this._onChangePowerTags.bind(this));
      html.find('.homebrew-power-input').change(this._onChangePowerDescription.bind(this));
      html.find('.homebrew-remove-power').click(this._onRemovePower.bind(this));
      html.find('.homebrew-submit-blasphemy').click(this._onSubmitBlasphemy.bind(this));

      
    }


    _onCreateNewPower(event) {
        event.preventDefault();
        this.blasphemyOptions.powers.push({
            name: "New Power",
            isPassive: false,
            keywords: "default",
            power: "Ability Description"    
            });
        this.render(true);
    }

    _onRemovePower(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        const newPowers = this.blasphemyOptions.powers.slice(0, powerIndex).concat(this.blasphemyOptions.powers.slice(Number(powerIndex)+1));
        this.blasphemyOptions.powers = newPowers;
        this.render(true);
    }

    _onChangeBlasphemyName(event) {
        event.preventDefault();
        this.blasphemyOptions.name = event.currentTarget.value;
        this.render(true);
    }

    _onChangePowerName(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].name = event.currentTarget.value;
        this.render(true);
    }

    _onChangePowerDescription(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].powerDescription = event.currentTarget.value;
        this.render(true);
    }

    _onChangePowerTags(event) {
        event.preventDefault();
        const powerIndex = event.currentTarget.getAttribute('data-power-index');
        this.blasphemyOptions.powers[powerIndex].keywords = event.currentTarget.value;
        this.render(true);
    }


    async _onSubmitBlasphemy(event) {
        event.preventDefault();
        let blasphemyFolderFolder = game.folders.find(f => f.name === "Blasphemy Data" && f.type === "Item");
        if (!blasphemyFolderFolder) {
            blasphemyFolderFolder = await Folder.create({
                name: "Blasphemy Data",
                type: "Item",
                folder: null,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let blasphemyFolder = game.folders.find(f => f.name === "Blasphemies" && f.type === "Item");
        if (!blasphemyFolder) {
            blasphemyFolder = await Folder.create({
                name: "Blasphemies",
                type: "Item",
                folder: blasphemyFolderFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let blasphemyPowerFolder = game.folders.find(f => f.name === "Blasphemy Powers" && f.type === "Item");
        if (!blasphemyPowerFolder) {
            blasphemyPowerFolder = await Folder.create({
                name: "Blasphemy Powers",
                type: "Item",
                folder: blasphemyFolderFolder.id,  // Set a parent folder ID if nesting is desired
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
                    powerDescription: power.powerDescription
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
    }

    _onCreateNewTask(event) {
        event.preventDefault();
        this.agendaOptions.tasks.push({
            task: "New Task",
            isBold: true    
            });
        this.render(true);
    }

    _onCreateNewAbility(event) {
        event.preventDefault();
        this.agendaOptions.abilities.push({
            name: "New Ability",
            ability: "Ability Description"    
            });
        this.render(true);
    }

    _onRemoveTask(event) {
        event.preventDefault();
        const taskIndex = event.currentTarget.getAttribute('data-task-index');
        const newTasks = this.agendaOptions.tasks.slice(0, taskIndex).concat(this.agendaOptions.tasks.slice(Number(taskIndex)+1));
        this.agendaOptions.tasks = newTasks;
        this.render(true);
    }

    _onRemoveAbility(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        const newAbilities = this.agendaOptions.abilities.slice(0, abilityIndex).concat(this.agendaOptions.abilities.slice(Number(abilityIndex)+1));
        this.agendaOptions.abilities = newAbilities;
        this.render(true);
    }

    _onChangeAgendaName(event) {
        event.preventDefault();
        this.agendaOptions.name = event.currentTarget.value;
        this.render(true);
    }


    _onChangeTaskName(event) {
        event.preventDefault();
        const taskIndex = event.currentTarget.getAttribute('data-task-index');
        this.agendaOptions.tasks[taskIndex].task = event.currentTarget.value;
        this.render(true);
    }

    _onChangeAbilityName(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        this.agendaOptions.abilities[abilityIndex].name = event.currentTarget.value;
        this.render(true);
    }

    _onChangeAbilityDescription(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        this.agendaOptions.abilities[abilityIndex].abilityDescription = event.currentTarget.value;
        this.render(true);
    }

    _onToggleBold(event) {
        event.preventDefault();
        const taskIndex = event.currentTarget.getAttribute('data-task-index');
        this.agendaOptions.tasks[taskIndex].isBold = !this.agendaOptions.tasks[taskIndex].isBold;
        this.render(true);
    }

    async _onSubmitAgenda(event) {
        event.preventDefault();
        let agendaFolderFolder = game.folders.find(f => f.name === "Agenda Data" && f.type === "Item");
        if (!agendaFolderFolder) {
            agendaFolderFolder = await Folder.create({
                name: "Agenda Data",
                type: "Item",
                folder: null,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let agendaFolder = game.folders.find(f => f.name === "Agendas" && f.type === "Item");
        if (!agendaFolder) {
            agendaFolder = await Folder.create({
                name: "Agendas",
                type: "Item",
                folder: agendaFolderFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let agendaTaskFolder = game.folders.find(f => f.name === "Agenda Tasks" && f.type === "Item");
        if (!agendaTaskFolder) {
            agendaTaskFolder = await Folder.create({
                name: "Agenda Tasks",
                type: "Item",
                folder: agendaFolderFolder.id,  // Set a parent folder ID if nesting is desired
                sorting: "m",  // 'm' for manual sorting, 'a' for alphabetical
            });
        }

        let agendaAbilityFolder = game.folders.find(f => f.name === "Agenda Abilities" && f.type === "Item");
        if (!agendaAbilityFolder) {
            agendaAbilityFolder = await Folder.create({
                name: "Agenda Abilities",
                type: "Item",
                folder: agendaFolderFolder.id,  // Set a parent folder ID if nesting is desired
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
    }
}
