const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// Default position if no saved position exists
const DEFAULT_POSITION = { top: 100, left: 100 };

// Tension moves from the CAIN rulebook
const TENSION_MOVES = [
  {
    id: 'send-minions',
    name: 'Send minions',
    description: 'Send traces or minions after the exorcists. They show up unexpectedly!'
  },
  {
    id: 'ambush',
    name: 'Ambush the exorcists',
    description: 'The sin attacks directly with surprise. If fought, banished at 4 slashes.'
  },
  {
    id: 'authorities',
    name: 'Involve authorities',
    description: 'Alert police, security, or military to the exorcists\' activities.'
  },
  {
    id: 'separate',
    name: 'Separate someone',
    description: 'Send an exorcist or NPC somewhere dangerous. Force the party to split.'
  },
  {
    id: 'choice',
    name: 'Force a difficult choice',
    description: 'Make them choose between two things they need. Take the other away.'
  },
  {
    id: 'escalate',
    name: 'Escalate the situation',
    description: 'Punch up tension dramatically. Conversation becomes arrest, car ride becomes chase.'
  },
  {
    id: 'afflict',
    name: 'Afflict the exorcists',
    description: 'Give a random affliction from the sin sheet, or a harmful hook.'
  },
  {
    id: 'clock',
    name: 'Start/progress a ticking clock',
    description: 'Create urgency: bomb timer, poison, trapped civilians. 2-3 segments = short, 4+ = long.'
  },
  {
    id: 'domain',
    name: 'Use a domain',
    description: 'Activate a domain-specific tension move. Check the Sin\'s domains.'
  },
  {
    id: 'npc',
    name: 'Threaten or twist an NPC',
    description: 'Put crosshairs on an NPC. Pull the trigger if exorcists don\'t react.'
  },
  {
    id: 'obstacle',
    name: 'Introduce a new obstacle',
    description: 'Block the path: police, security systems, locked doors, monsters.'
  },
];

// Hunt phases
const HUNT_PHASES = [
  { id: 'briefing', name: 'Briefing' },
  { id: 'arrival', name: 'Arrival' },
  { id: 'tracking', name: 'Tracking' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'preparation', name: 'Preparation' },
  { id: 'execution', name: 'Execution' },
];

class HuntTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: 'aside',
    id: 'hunt-tracker',
    classes: ['hunt-tracker'],
    window: {
      title: 'Hunt Tracker',
      positioned: true,
      minimizable: true,
      resizable: true,
    },
    position: {
      top: DEFAULT_POSITION.top,
      left: DEFAULT_POSITION.left,
      width: 420,
      height: 'auto',
    },
    actions: {
      incrementTension: function(event, target) { this._onIncrementTension(event, target); },
      decrementTension: function(event, target) { this._onDecrementTension(event, target); },
      incrementPressure: function(event, target) { this._onIncrementPressure(event, target); },
      decrementPressure: function(event, target) { this._onDecrementPressure(event, target); },
      advanceScene: function(event, target) { this._onAdvanceScene(event, target); },
      riskTriggered: function(event, target) { this._onRiskTriggered(event, target); },
      incrementExecution: function(event, target) { this._onIncrementExecution(event, target); },
      decrementExecution: function(event, target) { this._onDecrementExecution(event, target); },
      healSin: function(event, target) { this._onHealSin(event, target); },
      togglePalace: function(event, target) { this._onTogglePalace(event, target); },
      discoverTrauma: function(event, target) { this._onDiscoverTrauma(event, target); },
      resetTrauma: function(event, target) { this._onResetTrauma(event, target); },
      useTraumaCounter: function(event, target) { this._onUseTraumaCounter(event, target); },
      rollRandomTensionMove: function(event, target) { this._onRollRandomTensionMove(event, target); },
      addCustomClock: function(event, target) { this._onAddCustomClock(event, target); },
      tickCustomClock: function(event, target) { this._onTickCustomClock(event, target); },
      untickCustomClock: function(event, target) { this._onUntickCustomClock(event, target); },
      removeCustomClock: function(event, target) { this._onRemoveCustomClock(event, target); },
      partyRests: function(event, target) { this._onPartyRests(event, target); },
      startHunt: function(event, target) { this._onStartHunt(event, target); },
      endHunt: function(event, target) { this._onEndHunt(event, target); },
      resetMission: function(event, target) { this._onResetMission(event, target); },
      linkTalisman: function(event, target) { this._onLinkTalisman(event, target); },
      unlinkTalisman: function(event, target) { this._onUnlinkTalisman(event, target); },
      linkTensionTalisman: function(event, target) { this._onLinkTensionTalisman(event, target); },
      unlinkTensionTalisman: function(event, target) { this._onUnlinkTensionTalisman(event, target); },
      linkPressureTalisman: function(event, target) { this._onLinkPressureTalisman(event, target); },
      unlinkPressureTalisman: function(event, target) { this._onUnlinkPressureTalisman(event, target); },
    }
  }

  static PARTS = {
    main: {
      template: "systems/cain/module/components/hunt-tracker/hunt-tracker.hbs"
    }
  }

  static TENSION_MOVES = TENSION_MOVES;
  static HUNT_PHASES = HUNT_PHASES;

  // When first created, load saved position
  async _onFirstRender(context, options) {
    super._onFirstRender(context, options);

    // Load saved position
    const savedPosition = game.settings.get('cain', 'huntTrackerPosition');
    if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
      this.setPosition(savedPosition);
    }
  }

  // Add event listeners after render
  _onRender(context, options) {
    super._onRender(context, options);

    const html = this.element;

    // Phase select change handler
    const phaseSelect = html.querySelector('.phase-select');
    if (phaseSelect) {
      phaseSelect.addEventListener('change', async (event) => {
        if (!game.user.isGM) return;
        const phase = event.target.value;
        const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
        hunt.phase = phase;
        await game.settings.set('cain', 'currentHunt', hunt);
        this._emitUpdate();
      });
    }

    // Trauma answer input handlers
    const traumaInputs = html.querySelectorAll('.trauma-answer');
    traumaInputs.forEach(input => {
      input.addEventListener('change', async (event) => {
        if (!game.user.isGM) return;
        const index = parseInt(event.target.dataset.index);
        const value = event.target.value;
        const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
        if (hunt.traumas[index]) {
          hunt.traumas[index].answer = value;
          await game.settings.set('cain', 'currentHunt', hunt);
          this._emitUpdate();
        }
      });
    });

    // Notes textarea handler
    const notesTextarea = html.querySelector('.hunt-notes');
    if (notesTextarea) {
      notesTextarea.addEventListener('change', async (event) => {
        if (!game.user.isGM) return;
        const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
        hunt.notes = event.target.value;
        await game.settings.set('cain', 'currentHunt', hunt);
        this._emitUpdate();
      });
    }

    // Tension moves list toggle
    const tensionMovesSection = html.querySelector('.tension-moves-section .section-header');
    const tensionMovesList = html.querySelector('.tension-moves-list');
    if (tensionMovesSection && tensionMovesList) {
      tensionMovesSection.addEventListener('click', (event) => {
        // Don't toggle if clicking a button
        if (event.target.closest('button')) return;
        tensionMovesList.classList.toggle('collapsed');
      });
    }
  }

  // Save position when window is moved by user
  setPosition(position) {
    const result = super.setPosition(position);

    // Only save position if this was triggered by user interaction
    if (position && (position.top !== undefined || position.left !== undefined)) {
      if (this._positionSaveTimeout) {
        clearTimeout(this._positionSaveTimeout);
      }
      this._positionSaveTimeout = setTimeout(() => {
        const currentPos = this.position;
        if (currentPos.top !== undefined && currentPos.left !== undefined) {
          game.settings.set('cain', 'huntTrackerPosition', {
            top: currentPos.top,
            left: currentPos.left
          });
        }
      }, 100);
    }

    return result;
  }

  async _preparePartContext(partId, context) {
    const huntState = game.settings.get('cain', 'currentHunt');
    context.hunt = huntState;
    context.isGM = game.user.isGM;
    context.sinActor = huntState.sinActorId ? game.actors.get(huntState.sinActorId) : null;
    context.tensionMoves = TENSION_MOVES;
    context.huntPhases = HUNT_PHASES;

    // Get sin actors for the start hunt dropdown
    context.sinActors = game.actors.filter(a => a.type === 'sin' || a.type === 'npc');

    // Calculate execution talisman max (uses linked talisman max if linked)
    context.executionMax = this._getExecutionMax(huntState);

    // Add flattened values for easier template access in range blocks
    context.tensionMax = huntState.tension?.max || 3;
    context.tensionCurrent = huntState.tension?.current || 0;
    context.pressureMax = huntState.pressure?.max || 6;
    context.pressureCurrent = huntState.pressure?.current || 0;

    // Get global talismans for linking
    const globalTalismans = game.settings.get('cain', 'globalTalismans');
    context.globalTalismans = globalTalismans;

    // Get linked execution talisman if exists
    if (huntState.linkedTalismanIndex !== undefined && huntState.linkedTalismanIndex !== null) {
      context.linkedTalisman = globalTalismans[huntState.linkedTalismanIndex];
      context.linkedTalismanIndex = huntState.linkedTalismanIndex;
    } else {
      context.linkedTalisman = null;
    }

    // Get linked tension talisman if exists
    if (huntState.linkedTensionTalismanIndex !== undefined && huntState.linkedTensionTalismanIndex !== null) {
      const tensionTalisman = globalTalismans[huntState.linkedTensionTalismanIndex];
      context.linkedTensionTalisman = tensionTalisman;
      context.linkedTensionTalismanIndex = huntState.linkedTensionTalismanIndex;
      // Use talisman max if linked
      if (tensionTalisman) {
        context.tensionMax = tensionTalisman.maxMarkAmount;
        context.tensionCurrent = tensionTalisman.currMarkAmount;
      }
    } else {
      context.linkedTensionTalisman = null;
    }

    // Get linked pressure talisman if exists
    if (huntState.linkedPressureTalismanIndex !== undefined && huntState.linkedPressureTalismanIndex !== null) {
      const pressureTalisman = globalTalismans[huntState.linkedPressureTalismanIndex];
      context.linkedPressureTalisman = pressureTalisman;
      context.linkedPressureTalismanIndex = huntState.linkedPressureTalismanIndex;
      // Use talisman max if linked
      if (pressureTalisman) {
        context.pressureMax = pressureTalisman.maxMarkAmount;
        context.pressureCurrent = pressureTalisman.currMarkAmount;
      }
    } else {
      context.linkedPressureTalisman = null;
    }

    return context;
  }

  // Emit update to all clients
  _emitUpdate() {
    game.socket.emit('system.cain', { action: 'updateHunt' });
    this.render(true);
  }

  // ============== ACTION HANDLERS ==============

  async _onIncrementTension(event, target) {
    if (!game.user.isGM) return;
    await this._incrementTension('manual');
  }

  async _onDecrementTension(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.tension.current > 0) {
      hunt.tension.current--;
      await game.settings.set('cain', 'currentHunt', hunt);
      await this._syncToLinkedTensionTalisman(hunt.tension.current);
      this._emitUpdate();
    }
  }

  async _onIncrementPressure(event, target) {
    if (!game.user.isGM) return;
    await this._incrementPressure('manual');
  }

  async _onDecrementPressure(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.pressure.current > 0) {
      hunt.pressure.current--;
      hunt.pressure.outOfControl = false; // Reset out of control when decreasing
      // Recalculate execution
      hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;
      await game.settings.set('cain', 'currentHunt', hunt);
      await this._syncToLinkedPressureTalisman(hunt.pressure.current);
      this._emitUpdate();
    }
  }

  async _onAdvanceScene(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.sceneCount++;
    hunt.tension.sceneRiskTriggered = false; // Reset for new scene
    await game.settings.set('cain', 'currentHunt', hunt);

    // Check if we should increase tension (not during briefing or conflict)
    if (hunt.phase !== 'briefing') {
      await this._incrementTension('scene');
    } else {
      this._emitUpdate();
    }
  }

  async _onRiskTriggered(event, target) {
    if (!game.user.isGM) return;
    await this._incrementTension('risk');
  }

  async _onIncrementExecution(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    const executionMax = this._getExecutionMax(hunt);

    if (hunt.execution.current < executionMax) {
      hunt.execution.current++;
      await game.settings.set('cain', 'currentHunt', hunt);

      // Sync with linked global talisman if exists
      await this._syncToLinkedTalisman(hunt.execution.current);

      this._emitUpdate();
    }
  }

  async _onDecrementExecution(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.execution.current > 0) {
      hunt.execution.current--;
      await game.settings.set('cain', 'currentHunt', hunt);

      // Sync with linked global talisman if exists
      await this._syncToLinkedTalisman(hunt.execution.current);

      this._emitUpdate();
    }
  }

  /**
   * Sync the execution talisman value to the linked global talisman
   */
  async _syncToLinkedTalisman(newValue) {
    const hunt = game.settings.get('cain', 'currentHunt');
    if (hunt.linkedTalismanIndex === undefined || hunt.linkedTalismanIndex === null) return;

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedTalisman = talismans[hunt.linkedTalismanIndex];
    if (!linkedTalisman) return;

    // Update the talisman's current mark amount
    talismans[hunt.linkedTalismanIndex].currMarkAmount = newValue;

    // Update image path to match current marks
    const basePath = linkedTalisman.imagePath.replace(/-\d+\.png$/, '');
    talismans[hunt.linkedTalismanIndex].imagePath = `${basePath}-${newValue}.png`;

    await game.settings.set('cain', 'globalTalismans', talismans);

    // Emit update for talismans and re-render TalismanWindow
    game.socket.emit('system.cain', { action: 'updateTalismans' });
    this._refreshTalismanWindows();
  }

  /**
   * Refresh any open TalismanWindow instances
   */
  _refreshTalismanWindows() {
    for (const app of Object.values(ui.windows)) {
      if (app.constructor.name === 'TalismanWindow') {
        app.render(true);
      }
    }
  }

  async _onHealSin(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    // Roll healing dice
    const healDice = hunt.execution.current === 0 ? '2d3' : '1d3';
    const roll = await new Roll(healDice).roll();

    hunt.execution.current = Math.max(0, hunt.execution.current - roll.total);
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    await roll.toMessage({
      speaker: { alias: "CAIN System" },
      flavor: `<div class="hunt-message sin-heals">
        <h3>Sin Heals</h3>
        <p>The Sin heals <strong>${roll.total}</strong> slashes.</p>
      </div>`
    });
  }

  async _onTogglePalace(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.insidePalace = !hunt.insidePalace;
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    const status = hunt.insidePalace ? 'entered' : 'exited';
    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message palace-toggle">
        <h3>Palace ${hunt.insidePalace ? 'Entered' : 'Exited'}</h3>
        <p>The exorcists have ${status} the Sin's palace.</p>
        ${hunt.insidePalace ? '<p class="warning">The Sin cannot flee while inside the palace!</p>' : ''}
      </div>`
    });
  }

  async _onDiscoverTrauma(event, target) {
    if (!game.user.isGM) return;
    const traumaIndex = parseInt(target.dataset.index);
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (!hunt.traumas[traumaIndex]) return;
    hunt.traumas[traumaIndex].discovered = true;

    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message trauma-discovered">
        <h3>Trauma Discovered</h3>
        <p><strong>${hunt.traumas[traumaIndex].question}</strong></p>
        <p><em>${hunt.traumas[traumaIndex].answer || 'Answer not yet recorded'}</em></p>
        <p class="hint">This trauma can now be used to counter a Sin reaction during execution.</p>
      </div>`
    });
  }

  async _onResetTrauma(event, target) {
    if (!game.user.isGM) return;
    const traumaIndex = parseInt(target.dataset.index);
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (!hunt.traumas[traumaIndex]) return;

    // Reset the trauma to undiscovered state
    hunt.traumas[traumaIndex].discovered = false;
    hunt.traumas[traumaIndex].used = false;

    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    ui.notifications.info(`Trauma "${hunt.traumas[traumaIndex].question}" has been reset to undiscovered.`);
  }

  async _onUseTraumaCounter(event, target) {
    if (!game.user.isGM) return;
    const traumaIndex = parseInt(target.dataset.index);
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (!hunt.traumas[traumaIndex]?.discovered || hunt.traumas[traumaIndex]?.used) {
      ui.notifications.warn('This trauma cannot be used');
      return;
    }

    // Roll 1d3 for counter effect
    const roll = await new Roll('1d3').roll();
    hunt.traumas[traumaIndex].used = true;

    // Apply damage to sin execution talisman
    const executionMax = 6 + hunt.pressure.current + hunt.sinCategory;
    hunt.execution.current = Math.min(hunt.execution.current + roll.total, executionMax);

    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    await roll.toMessage({
      speaker: { alias: "CAIN System" },
      flavor: `<div class="hunt-message trauma-counter">
        <h3>Trauma Counter!</h3>
        <p><strong>Invoking:</strong> ${hunt.traumas[traumaIndex].question}</p>
        <hr>
        <p>Reduce incoming stress by <strong>${roll.total}</strong></p>
        <p>Deal <strong>${roll.total}</strong> slashes to the Sin!</p>
      </div>`
    });

    // Check for defeat
    if (hunt.execution.current >= executionMax) {
      await this._sinDefeated();
    }
  }

  async _onRollRandomTensionMove(event, target) {
    if (!game.user.isGM) return;

    const roll = await new Roll(`1d${TENSION_MOVES.length}`).roll();
    const move = TENSION_MOVES[roll.total - 1];

    await roll.toMessage({
      speaker: { alias: "CAIN System" },
      flavor: `<div class="hunt-message random-tension-move">
        <h3>Random Tension Move</h3>
        <p><strong>${move.name}</strong></p>
        <p>${move.description}</p>
      </div>`
    });
  }

  async _onAddCustomClock(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    // Show dialog to create new clock
    const content = `
      <form>
        <div class="form-group">
          <label>Clock Name</label>
          <input type="text" name="name" value="New Clock" />
        </div>
        <div class="form-group">
          <label>Max Segments</label>
          <input type="number" name="max" value="4" min="2" max="12" />
        </div>
      </form>
    `;

    new Dialog({
      title: 'Add Custom Clock',
      content,
      buttons: {
        add: {
          icon: '<i class="fas fa-plus"></i>',
          label: 'Add',
          callback: async (html) => {
            const name = html.find('[name="name"]').val();
            const max = parseInt(html.find('[name="max"]').val());

            const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
            hunt.customTalismans.push({
              id: foundry.utils.randomID(),
              name: name,
              current: 0,
              max: max
            });

            await game.settings.set('cain', 'currentHunt', hunt);
            self._emitUpdate();
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'add'
    }).render(true);
  }

  async _onTickCustomClock(event, target) {
    if (!game.user.isGM) return;
    const clockId = target.dataset.clockId;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    const clock = hunt.customTalismans.find(c => c.id === clockId);

    if (!clock) return;

    if (clock.current < clock.max) {
      clock.current++;
      await game.settings.set('cain', 'currentHunt', hunt);
      this._emitUpdate();

      if (clock.current >= clock.max) {
        ChatMessage.create({
          speaker: { alias: "CAIN System" },
          content: `<div class="hunt-message clock-filled">
            <h3>Clock Filled: ${clock.name}</h3>
            <p>The countdown has completed!</p>
          </div>`
        });
      }
    }
  }

  async _onUntickCustomClock(event, target) {
    if (!game.user.isGM) return;
    const clockId = target.dataset.clockId;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    const clock = hunt.customTalismans.find(c => c.id === clockId);

    if (!clock || clock.current <= 0) return;

    clock.current--;
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }

  async _onRemoveCustomClock(event, target) {
    if (!game.user.isGM) return;
    const clockId = target.dataset.clockId;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.customTalismans = hunt.customTalismans.filter(c => c.id !== clockId);
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }

  async _onPartyRests(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    const confirmed = await Dialog.confirm({
      title: 'Party Rest',
      content: `<p>Resting will <strong>increase pressure by 1</strong>.</p>
                <p>Each exorcist will roll 2d3 to recover.</p>
                <p>Continue?</p>`
    });

    if (!confirmed) return;

    await self._incrementPressure('rest');

    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message party-rest">
        <h2>Party Rests</h2>
        <p><strong>Pressure increased by 1.</strong></p>
        <hr>
        <p>Each exorcist rolls <strong>2d3</strong> and assigns each die to one of:</p>
        <ul>
          <li>Regain that many <strong>psyche bursts</strong></li>
          <li>Recover <strong>stress</strong> equal to the die</li>
          <li>Erase slashes on a <strong>hook</strong> equal to the die</li>
        </ul>
        <p><em>Same choice can be made twice.</em></p>
      </div>`
    });
  }

  async _onStartHunt(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    // Get available sin actors
    const sinActors = game.actors.filter(a => a.type === 'sin' || a.type === 'npc');

    if (sinActors.length === 0) {
      ui.notifications.warn('No Sin actors found. Create a Sin actor first.');
      return;
    }

    const options = sinActors.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

    const content = `
      <form>
        <div class="form-group">
          <label>Select Sin</label>
          <select name="sinId">${options}</select>
        </div>
        <div class="form-group">
          <label>Custom Trauma Questions (one per line, leave blank to use defaults)</label>
          <textarea name="traumas" rows="4" placeholder="Who was the host?&#10;What trauma caused this?&#10;Where is the palace?"></textarea>
        </div>
      </form>
    `;

    new Dialog({
      title: 'Start New Hunt',
      content,
      buttons: {
        start: {
          icon: '<i class="fas fa-skull"></i>',
          label: 'Start Hunt',
          callback: async (html) => {
            const sinId = html.find('[name="sinId"]').val();
            const traumasText = html.find('[name="traumas"]').val();
            const sinActor = game.actors.get(sinId);

            if (!sinActor) return;

            // Parse trauma questions
            let traumaQuestions;
            if (traumasText.trim()) {
              traumaQuestions = traumasText.split('\n').filter(q => q.trim());
            } else {
              // Default trauma questions
              traumaQuestions = [
                'Who was the host?',
                'What trauma caused this?',
                'Where is the palace?'
              ];
            }

            const category = sinActor.system.category || 0;

            const huntState = {
              active: true,
              sinActorId: sinActor.id,
              sinName: sinActor.name,
              sinType: sinActor.system.sinType || 'unknown',
              sinCategory: category,
              tension: { current: 0, max: 3, sceneRiskTriggered: false },
              pressure: { current: 0, max: 6, outOfControl: false },
              execution: {
                base: 6,
                current: 0,
                calculated: 6 + category
              },
              traumas: traumaQuestions.map(q => ({
                question: q,
                answer: '',
                discovered: false,
                used: false
              })),
              customTalismans: [],
              notes: '',
              sceneCount: 0,
              insidePalace: false,
              phase: 'briefing'
            };

            await game.settings.set('cain', 'currentHunt', huntState);
            self._emitUpdate();

            ChatMessage.create({
              speaker: { alias: "CAIN System" },
              content: `<div class="hunt-message hunt-started">
                <h2>Hunt Initiated</h2>
                <p><strong>Target:</strong> ${sinActor.name}</p>
                <p><strong>Type:</strong> ${sinActor.system.sinType || 'Unknown'}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Execution Talisman:</strong> ${6 + category} slashes</p>
              </div>`
            });
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'start'
    }).render(true);
  }

  async _onEndHunt(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    const content = `
      <form>
        <div class="form-group">
          <label>Hunt Outcome</label>
          <select name="outcome">
            <option value="success">Success - Sin Executed (5 scrip each)</option>
            <option value="spare">Sin Spared (3 scrip each)</option>
            <option value="failure">Failure (lose 1 scrip each)</option>
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: 'End Hunt',
      content,
      buttons: {
        end: {
          icon: '<i class="fas fa-flag-checkered"></i>',
          label: 'End Hunt',
          callback: async (html) => {
            const outcome = html.find('[name="outcome"]').val();

            let scrip = 0;
            let message = '';

            switch(outcome) {
              case 'success':
                scrip = 5;
                message = 'Execution successful. Each exorcist earns 5 scrip.';
                break;
              case 'spare':
                scrip = 3;
                message = 'Sin spared. Each exorcist earns 3 scrip.';
                break;
              case 'failure':
                scrip = -1;
                message = 'Execution failed. Each exorcist loses 1 scrip.';
                break;
            }

            // Reset hunt state
            await game.settings.set('cain', 'currentHunt', {
              active: false,
              sinActorId: null,
              sinName: '',
              sinType: '',
              sinCategory: 0,
              tension: { current: 0, max: 3, sceneRiskTriggered: false },
              pressure: { current: 0, max: 6, outOfControl: false },
              execution: { base: 6, current: 0, calculated: 6 },
              traumas: [],
              customTalismans: [],
              notes: '',
              sceneCount: 0,
              insidePalace: false,
              phase: 'briefing'
            });

            self._emitUpdate();

            ChatMessage.create({
              speaker: { alias: "CAIN System" },
              content: `<div class="hunt-message hunt-ended">
                <h2>Exfiltration Complete</h2>
                <p>${message}</p>
                <p>All exorcists' sin should be halved.</p>
                <p>Mark a <strong>mission survived</strong> for each exorcist.</p>
              </div>`
            });
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'cancel'
    }).render(true);
  }

  async _onResetMission(event, target) {
    if (!game.user.isGM) return;

    const confirmed = await Dialog.confirm({
      title: 'Reset Mission',
      content: `<p>This will reset all exorcist characters to mission-start state:</p>
                <ul>
                  <li>Stress to 0</li>
                  <li>3 psyche bursts</li>
                  <li>Kit points to max</li>
                </ul>
                <p>Continue?</p>`
    });

    if (!confirmed) return;

    // Reset all exorcist characters
    for (const actor of game.actors.filter(a => a.type === 'character')) {
      await actor.update({
        'system.stress.value': 0,
        'system.psycheBurst.value': 3,
        'system.kitPoints.value': actor.system.kitPoints.max,
      });
    }

    ui.notifications.info('All exorcists reset to mission-start state');

    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message mission-reset">
        <h2>Mission Reset</h2>
        <p>All exorcists have been reset to mission-start state.</p>
      </div>`
    });
  }

  async _onLinkTalisman(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    const globalTalismans = game.settings.get('cain', 'globalTalismans');

    if (!globalTalismans || globalTalismans.length === 0) {
      ui.notifications.warn('No global talismans found. Create a talisman in the Talismans window first.');
      return;
    }

    // Build options list
    const options = globalTalismans.map((t, idx) =>
      `<option value="${idx}">${t.name} (${t.currMarkAmount}/${t.maxMarkAmount})</option>`
    ).join('');

    const content = `
      <form>
        <div class="form-group">
          <label>Select Talisman to Link</label>
          <select name="talismanIndex">${options}</select>
        </div>
        <p class="notes">The execution talisman will sync with this global talisman. Changes to either will update both.</p>
      </form>
    `;

    new Dialog({
      title: 'Link Execution Talisman',
      content,
      buttons: {
        link: {
          icon: '<i class="fas fa-link"></i>',
          label: 'Link',
          callback: async (html) => {
            const talismanIndex = parseInt(html.find('[name="talismanIndex"]').val());
            const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

            hunt.linkedTalismanIndex = talismanIndex;

            // Sync current execution value to the talisman
            const talismans = game.settings.get('cain', 'globalTalismans');
            talismans[talismanIndex].currMarkAmount = hunt.execution.current;
            // Update image path to match current marks
            const basePath = talismans[talismanIndex].imagePath.replace(/-\d+\.png$/, '');
            talismans[talismanIndex].imagePath = `${basePath}-${hunt.execution.current}.png`;

            await game.settings.set('cain', 'globalTalismans', talismans);
            await game.settings.set('cain', 'currentHunt', hunt);

            // Emit updates for both
            game.socket.emit('system.cain', { action: 'updateTalismans' });
            self._emitUpdate();

            ui.notifications.info(`Linked execution talisman to ${talismans[talismanIndex].name}`);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'link'
    }).render(true);
  }

  async _onUnlinkTalisman(event, target) {
    if (!game.user.isGM) return;

    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (hunt.linkedTalismanIndex === undefined || hunt.linkedTalismanIndex === null) {
      ui.notifications.warn('No talisman is currently linked');
      return;
    }

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedName = talismans[hunt.linkedTalismanIndex]?.name || 'Unknown';

    hunt.linkedTalismanIndex = null;
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    ui.notifications.info(`Unlinked execution talisman from ${linkedName}`);
  }

  async _onLinkTensionTalisman(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    const globalTalismans = game.settings.get('cain', 'globalTalismans');

    if (!globalTalismans || globalTalismans.length === 0) {
      ui.notifications.warn('No global talismans found. Create a talisman in the Talismans window first.');
      return;
    }

    const options = globalTalismans.map((t, idx) =>
      `<option value="${idx}">${t.name} (${t.currMarkAmount}/${t.maxMarkAmount})</option>`
    ).join('');

    const content = `
      <form>
        <div class="form-group">
          <label>Select Talisman to Link</label>
          <select name="talismanIndex">${options}</select>
        </div>
        <p class="notes">The tension talisman will sync with this global talisman. The talisman's max value will be used.</p>
      </form>
    `;

    new Dialog({
      title: 'Link Tension Talisman',
      content,
      buttons: {
        link: {
          icon: '<i class="fas fa-link"></i>',
          label: 'Link',
          callback: async (html) => {
            const talismanIndex = parseInt(html.find('[name="talismanIndex"]').val());
            const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

            hunt.linkedTensionTalismanIndex = talismanIndex;

            // Sync current tension value to the talisman
            const talismans = game.settings.get('cain', 'globalTalismans');
            talismans[talismanIndex].currMarkAmount = hunt.tension.current;
            const basePath = talismans[talismanIndex].imagePath.replace(/-\d+\.png$/, '');
            talismans[talismanIndex].imagePath = `${basePath}-${hunt.tension.current}.png`;

            // Update hunt tension max to match talisman
            hunt.tension.max = talismans[talismanIndex].maxMarkAmount;

            await game.settings.set('cain', 'globalTalismans', talismans);
            await game.settings.set('cain', 'currentHunt', hunt);

            game.socket.emit('system.cain', { action: 'updateTalismans' });
            self._emitUpdate();

            ui.notifications.info(`Linked tension talisman to ${talismans[talismanIndex].name}`);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'link'
    }).render(true);
  }

  async _onUnlinkTensionTalisman(event, target) {
    if (!game.user.isGM) return;

    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (hunt.linkedTensionTalismanIndex === undefined || hunt.linkedTensionTalismanIndex === null) {
      ui.notifications.warn('No tension talisman is currently linked');
      return;
    }

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedName = talismans[hunt.linkedTensionTalismanIndex]?.name || 'Unknown';

    hunt.linkedTensionTalismanIndex = null;
    hunt.tension.max = 3; // Reset to default
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    ui.notifications.info(`Unlinked tension talisman from ${linkedName}`);
  }

  async _onLinkPressureTalisman(event, target) {
    if (!game.user.isGM) return;
    const self = this;

    const globalTalismans = game.settings.get('cain', 'globalTalismans');

    if (!globalTalismans || globalTalismans.length === 0) {
      ui.notifications.warn('No global talismans found. Create a talisman in the Talismans window first.');
      return;
    }

    const options = globalTalismans.map((t, idx) =>
      `<option value="${idx}">${t.name} (${t.currMarkAmount}/${t.maxMarkAmount})</option>`
    ).join('');

    const content = `
      <form>
        <div class="form-group">
          <label>Select Talisman to Link</label>
          <select name="talismanIndex">${options}</select>
        </div>
        <p class="notes">The pressure talisman will sync with this global talisman. The talisman's max value will be used.</p>
      </form>
    `;

    new Dialog({
      title: 'Link Pressure Talisman',
      content,
      buttons: {
        link: {
          icon: '<i class="fas fa-link"></i>',
          label: 'Link',
          callback: async (html) => {
            const talismanIndex = parseInt(html.find('[name="talismanIndex"]').val());
            const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

            hunt.linkedPressureTalismanIndex = talismanIndex;

            // Sync current pressure value to the talisman
            const talismans = game.settings.get('cain', 'globalTalismans');
            talismans[talismanIndex].currMarkAmount = hunt.pressure.current;
            const basePath = talismans[talismanIndex].imagePath.replace(/-\d+\.png$/, '');
            talismans[talismanIndex].imagePath = `${basePath}-${hunt.pressure.current}.png`;

            // Update hunt pressure max to match talisman
            hunt.pressure.max = talismans[talismanIndex].maxMarkAmount;

            await game.settings.set('cain', 'globalTalismans', talismans);
            await game.settings.set('cain', 'currentHunt', hunt);

            game.socket.emit('system.cain', { action: 'updateTalismans' });
            self._emitUpdate();

            ui.notifications.info(`Linked pressure talisman to ${talismans[talismanIndex].name}`);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel'
        }
      },
      default: 'link'
    }).render(true);
  }

  async _onUnlinkPressureTalisman(event, target) {
    if (!game.user.isGM) return;

    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    if (hunt.linkedPressureTalismanIndex === undefined || hunt.linkedPressureTalismanIndex === null) {
      ui.notifications.warn('No pressure talisman is currently linked');
      return;
    }

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedName = talismans[hunt.linkedPressureTalismanIndex]?.name || 'Unknown';

    hunt.linkedPressureTalismanIndex = null;
    hunt.pressure.max = 6; // Reset to default
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    ui.notifications.info(`Unlinked pressure talisman from ${linkedName}`);
  }

  // ============== HELPER METHODS ==============

  /**
   * Calculate the execution talisman max value
   * If linked to a global talisman, uses the talisman's max value
   * Otherwise, uses 6 + pressure + CAT
   */
  _getExecutionMax(hunt) {
    if (!hunt?.active) return 6;

    // If linked to a talisman, use its max
    if (hunt.linkedTalismanIndex !== undefined && hunt.linkedTalismanIndex !== null) {
      const globalTalismans = game.settings.get('cain', 'globalTalismans');
      const linkedTalisman = globalTalismans[hunt.linkedTalismanIndex];
      if (linkedTalisman) {
        return linkedTalisman.maxMarkAmount;
      }
    }

    // Default calculation: 6 + pressure + CAT
    return 6 + (hunt.pressure?.current || 0) + (hunt.sinCategory || 0);
  }

  async _incrementTension(source = 'manual') {
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    // Check if risk-1 already triggered this scene
    if (source === 'risk' && hunt.tension.sceneRiskTriggered) {
      ui.notifications.warn('Risk roll already triggered tension this scene');
      return;
    }

    // Check if already at max (for manual increases)
    if (hunt.tension.current >= hunt.tension.max) {
      // Already at max, trigger overflow
      await this._onTensionFilled(hunt);
      return;
    }

    hunt.tension.current++;
    if (source === 'risk') hunt.tension.sceneRiskTriggered = true;

    // Check for overflow
    if (hunt.tension.current >= hunt.tension.max) {
      await this._onTensionFilled(hunt);
    } else {
      await game.settings.set('cain', 'currentHunt', hunt);
      // Sync with linked tension talisman
      await this._syncToLinkedTensionTalisman(hunt.tension.current);
      this._emitUpdate();
    }
  }

  async _onTensionFilled(hunt) {
    hunt.tension.current = 0;
    hunt.tension.sceneRiskTriggered = false;
    hunt.pressure.current++;

    // Recalculate execution
    hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;

    // Check pressure overflow
    if (hunt.pressure.current >= hunt.pressure.max && !hunt.pressure.outOfControl) {
      hunt.pressure.outOfControl = true;
      await this._onPressureOutOfControl(hunt);
    }

    await game.settings.set('cain', 'currentHunt', hunt);

    // Sync linked talismans (tension reset to 0, pressure increased)
    await this._syncToLinkedTensionTalisman(0);
    await this._syncToLinkedPressureTalisman(hunt.pressure.current);

    this._emitUpdate();

    // Prompt tension move
    await this._promptTensionMove();
  }

  async _incrementPressure(source = 'manual') {
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    // Check if already at or above max
    if (hunt.pressure.current >= hunt.pressure.max) {
      ui.notifications.warn('Pressure is already at maximum');
      return;
    }

    hunt.pressure.current++;

    // Recalculate execution talisman
    hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;

    // Check for out of control
    if (hunt.pressure.current >= hunt.pressure.max && !hunt.pressure.outOfControl) {
      hunt.pressure.outOfControl = true;
      await this._onPressureOutOfControl(hunt);
    }

    await game.settings.set('cain', 'currentHunt', hunt);
    // Sync with linked pressure talisman
    await this._syncToLinkedPressureTalisman(hunt.pressure.current);
    this._emitUpdate();
  }

  /**
   * Sync the tension talisman value to the linked global talisman
   */
  async _syncToLinkedTensionTalisman(newValue) {
    const hunt = game.settings.get('cain', 'currentHunt');
    if (hunt.linkedTensionTalismanIndex === undefined || hunt.linkedTensionTalismanIndex === null) return;

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedTalisman = talismans[hunt.linkedTensionTalismanIndex];
    if (!linkedTalisman) return;

    talismans[hunt.linkedTensionTalismanIndex].currMarkAmount = newValue;
    const basePath = linkedTalisman.imagePath.replace(/-\d+\.png$/, '');
    talismans[hunt.linkedTensionTalismanIndex].imagePath = `${basePath}-${newValue}.png`;

    await game.settings.set('cain', 'globalTalismans', talismans);
    game.socket.emit('system.cain', { action: 'updateTalismans' });
    this._refreshTalismanWindows();
  }

  /**
   * Sync the pressure talisman value to the linked global talisman
   */
  async _syncToLinkedPressureTalisman(newValue) {
    const hunt = game.settings.get('cain', 'currentHunt');
    if (hunt.linkedPressureTalismanIndex === undefined || hunt.linkedPressureTalismanIndex === null) return;

    const talismans = game.settings.get('cain', 'globalTalismans');
    const linkedTalisman = talismans[hunt.linkedPressureTalismanIndex];
    if (!linkedTalisman) return;

    talismans[hunt.linkedPressureTalismanIndex].currMarkAmount = newValue;
    const basePath = linkedTalisman.imagePath.replace(/-\d+\.png$/, '');
    talismans[hunt.linkedPressureTalismanIndex].imagePath = `${basePath}-${newValue}.png`;

    await game.settings.set('cain', 'globalTalismans', talismans);
    game.socket.emit('system.cain', { action: 'updateTalismans' });
    this._refreshTalismanWindows();
  }

  async _onPressureOutOfControl(hunt) {
    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message pressure-overflow">
        <h2>PRESSURE OVERFLOW</h2>
        <p>The situation has gone out of control!</p>
        <p>The Sin gains <strong>+1 CAT</strong> and activates its overflow effect.</p>
        <p>Check the Sin's pressure description for specific effects.</p>
      </div>`
    });
  }

  async _promptTensionMove() {
    const hunt = game.settings.get('cain', 'currentHunt');

    const movesList = TENSION_MOVES.map(m =>
      `<li><strong>${m.name}:</strong> ${m.description}</li>`
    ).join('');

    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message tension-move-prompt">
        <h2>Tension Filled!</h2>
        <p>Pressure increased. Choose a tension move:</p>
        <ul>${movesList}</ul>
        <p><em>Or improvise based on the situation!</em></p>
      </div>`
    });
  }

  async _sinRetreats() {
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    // Determine healing dice
    const healDice = hunt.execution.current === 0 ? '2d3' : '1d3';
    const roll = await new Roll(healDice).roll();

    hunt.execution.current = Math.max(0, hunt.execution.current - roll.total);

    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();

    await roll.toMessage({
      speaker: { alias: "CAIN System" },
      flavor: `<div class="hunt-message sin-retreats">
        <h2>Sin Retreats!</h2>
        <p>The Sin flees to its palace.</p>
        <p>It cannot leave until <strong>pressure increases</strong>.</p>
        <hr>
        <p>Sin heals <strong>${roll.total}</strong> slashes.</p>
      </div>`
    });
  }

  async _sinDefeated() {
    ChatMessage.create({
      speaker: { alias: "CAIN System" },
      content: `<div class="hunt-message sin-defeated">
        <h2>SIN EXECUTED</h2>
        <p>The Sin has been destroyed!</p>
        <p>Proceed to exfiltration phase.</p>
      </div>`
    });
  }
}

export default HuntTracker;
