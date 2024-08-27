import { CainAgenda, CainAgendaTask, CainAgendaAbility } from "../data/_module.mjs";

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
            ability: "Ability Description"
        },
        {
            name: "Ability 2",
            ability: "Ability Description"
        },
        {
            name: "Ability 3",
            ability: "Ability Description"
        },
        {
            name: "Ability 4",
            ability: "Ability Description"
        },
        {
            name: "Ability 5",
            ability: "Ability Description"
        },
        {
            name: "Ability 6",
            ability: "Ability Description"
        },
        ]
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
            agendaOptions: this.agendaOptions
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
        const newTasks = this.agendaOptions.tasks.slice(0, taskIndex).concat(this.agendaOptions.tasks.slice(taskIndex+1));
        this.agendaOptions.tasks = newTasks;
        this.render(true);
    }

    _onRemoveAbility(event) {
        event.preventDefault();
        const abilityIndex = event.currentTarget.getAttribute('data-ability-index');
        const newAbilities = this.agendaOptions.abilities.slice(0, abilityIndex).concat(this.agendaOptions.abilities.slice(abilityIndex+1));
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
        this.agendaOptions.abilities[abilityIndex].ability = event.currentTarget.value;
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
                    abilityDescription: ability.description
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
