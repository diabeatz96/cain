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
      incrementTension: HuntTracker._onIncrementTension,
      decrementTension: HuntTracker._onDecrementTension,
      incrementPressure: HuntTracker._onIncrementPressure,
      decrementPressure: HuntTracker._onDecrementPressure,
      advanceScene: HuntTracker._onAdvanceScene,
      riskTriggered: HuntTracker._onRiskTriggered,
      incrementExecution: HuntTracker._onIncrementExecution,
      decrementExecution: HuntTracker._onDecrementExecution,
      healSin: HuntTracker._onHealSin,
      togglePalace: HuntTracker._onTogglePalace,
      discoverTrauma: HuntTracker._onDiscoverTrauma,
      useTraumaCounter: HuntTracker._onUseTraumaCounter,
      rollRandomTensionMove: HuntTracker._onRollRandomTensionMove,
      addCustomClock: HuntTracker._onAddCustomClock,
      tickCustomClock: HuntTracker._onTickCustomClock,
      untickCustomClock: HuntTracker._onUntickCustomClock,
      removeCustomClock: HuntTracker._onRemoveCustomClock,
      partyRests: HuntTracker._onPartyRests,
      startHunt: HuntTracker._onStartHunt,
      endHunt: HuntTracker._onEndHunt,
      resetMission: HuntTracker._onResetMission,
      setPhase: HuntTracker._onSetPhase,
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

    // Calculate execution talisman max
    if (huntState.active) {
      context.executionMax = 6 + huntState.pressure.current + huntState.sinCategory;
    } else {
      context.executionMax = 6;
    }

    return context;
  }

  // Emit update to all clients
  _emitUpdate() {
    game.socket.emit('system.cain', { action: 'updateHunt' });
    this.render(true);
  }

  // ============== ACTION HANDLERS ==============

  static async _onIncrementTension(event, target) {
    if (!game.user.isGM) return;
    await this._incrementTension('manual');
  }

  static async _onDecrementTension(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.tension.current > 0) {
      hunt.tension.current--;
      await game.settings.set('cain', 'currentHunt', hunt);
      this._emitUpdate();
    }
  }

  static async _onIncrementPressure(event, target) {
    if (!game.user.isGM) return;
    await this._incrementPressure('manual');
  }

  static async _onDecrementPressure(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.pressure.current > 0) {
      hunt.pressure.current--;
      // Recalculate execution
      hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;
      await game.settings.set('cain', 'currentHunt', hunt);
      this._emitUpdate();
    }
  }

  static async _onAdvanceScene(event, target) {
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

  static async _onRiskTriggered(event, target) {
    if (!game.user.isGM) return;
    await this._incrementTension('risk');
  }

  static async _onIncrementExecution(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    const executionMax = 6 + hunt.pressure.current + hunt.sinCategory;

    if (hunt.execution.current < executionMax) {
      hunt.execution.current++;
      await game.settings.set('cain', 'currentHunt', hunt);
      this._emitUpdate();

      // Check for retreat (outside palace at 4 slashes) or defeat
      if (!hunt.insidePalace && hunt.execution.current >= 4) {
        await this._sinRetreats();
      } else if (hunt.execution.current >= executionMax) {
        await this._sinDefeated();
      }
    }
  }

  static async _onDecrementExecution(event, target) {
    if (!game.user.isGM) return;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    if (hunt.execution.current > 0) {
      hunt.execution.current--;
      await game.settings.set('cain', 'currentHunt', hunt);
      this._emitUpdate();
    }
  }

  static async _onHealSin(event, target) {
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

  static async _onTogglePalace(event, target) {
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

  static async _onDiscoverTrauma(event, target) {
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

  static async _onUseTraumaCounter(event, target) {
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

  static async _onRollRandomTensionMove(event, target) {
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

  static async _onAddCustomClock(event, target) {
    if (!game.user.isGM) return;

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
            this._emitUpdate();
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

  static async _onTickCustomClock(event, target) {
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

  static async _onUntickCustomClock(event, target) {
    if (!game.user.isGM) return;
    const clockId = target.dataset.clockId;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    const clock = hunt.customTalismans.find(c => c.id === clockId);

    if (!clock || clock.current <= 0) return;

    clock.current--;
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }

  static async _onRemoveCustomClock(event, target) {
    if (!game.user.isGM) return;
    const clockId = target.dataset.clockId;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.customTalismans = hunt.customTalismans.filter(c => c.id !== clockId);
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }

  static async _onPartyRests(event, target) {
    if (!game.user.isGM) return;

    const confirmed = await Dialog.confirm({
      title: 'Party Rest',
      content: `<p>Resting will <strong>increase pressure by 1</strong>.</p>
                <p>Each exorcist will roll 2d3 to recover.</p>
                <p>Continue?</p>`
    });

    if (!confirmed) return;

    await this._incrementPressure('rest');

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

  static async _onStartHunt(event, target) {
    if (!game.user.isGM) return;

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
            this._emitUpdate();

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

  static async _onEndHunt(event, target) {
    if (!game.user.isGM) return;

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

            this._emitUpdate();

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

  static async _onResetMission(event, target) {
    if (!game.user.isGM) return;

    const confirmed = await Dialog.confirm({
      title: 'Reset Mission',
      content: `<p>This will reset all exorcist characters to mission-start state:</p>
                <ul>
                  <li>Stress to max</li>
                  <li>3 psyche bursts</li>
                  <li>Kit points to max</li>
                </ul>
                <p>Continue?</p>`
    });

    if (!confirmed) return;

    // Reset all exorcist characters
    for (const actor of game.actors.filter(a => a.type === 'character')) {
      await actor.update({
        'system.stress.value': actor.system.stress.max,
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

  static async _onSetPhase(event, target) {
    if (!game.user.isGM) return;
    const phase = target.dataset.phase;
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.phase = phase;
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }

  // ============== HELPER METHODS ==============

  async _incrementTension(source = 'manual') {
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

    // Check if risk-1 already triggered this scene
    if (source === 'risk' && hunt.tension.sceneRiskTriggered) {
      ui.notifications.warn('Risk roll already triggered tension this scene');
      return;
    }

    hunt.tension.current++;
    if (source === 'risk') hunt.tension.sceneRiskTriggered = true;

    // Check for overflow
    if (hunt.tension.current >= hunt.tension.max) {
      await this._onTensionFilled(hunt);
    } else {
      await game.settings.set('cain', 'currentHunt', hunt);
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
    this._emitUpdate();

    // Prompt tension move
    await this._promptTensionMove();
  }

  async _incrementPressure(source = 'manual') {
    const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
    hunt.pressure.current++;

    // Recalculate execution talisman
    hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;

    // Check for out of control
    if (hunt.pressure.current >= hunt.pressure.max && !hunt.pressure.outOfControl) {
      hunt.pressure.outOfControl = true;
      await this._onPressureOutOfControl(hunt);
    }

    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
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

// Make static methods work with 'this' context by binding them
// This is needed because ApplicationV2 actions call static methods
const staticMethods = [
  '_onIncrementTension', '_onDecrementTension',
  '_onIncrementPressure', '_onDecrementPressure',
  '_onAdvanceScene', '_onRiskTriggered',
  '_onIncrementExecution', '_onDecrementExecution',
  '_onHealSin', '_onTogglePalace',
  '_onDiscoverTrauma', '_onUseTraumaCounter',
  '_onRollRandomTensionMove', '_onAddCustomClock',
  '_onTickCustomClock', '_onUntickCustomClock', '_onRemoveCustomClock',
  '_onPartyRests', '_onStartHunt', '_onEndHunt',
  '_onResetMission', '_onSetPhase'
];

// Helper methods need to be instance methods, not static
HuntTracker.prototype._incrementTension = HuntTracker.prototype._incrementTension || async function(source) {
  const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));

  if (source === 'risk' && hunt.tension.sceneRiskTriggered) {
    ui.notifications.warn('Risk roll already triggered tension this scene');
    return;
  }

  hunt.tension.current++;
  if (source === 'risk') hunt.tension.sceneRiskTriggered = true;

  if (hunt.tension.current >= hunt.tension.max) {
    await this._onTensionFilled(hunt);
  } else {
    await game.settings.set('cain', 'currentHunt', hunt);
    this._emitUpdate();
  }
};

HuntTracker.prototype._onTensionFilled = async function(hunt) {
  hunt.tension.current = 0;
  hunt.tension.sceneRiskTriggered = false;
  hunt.pressure.current++;
  hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;

  if (hunt.pressure.current >= hunt.pressure.max && !hunt.pressure.outOfControl) {
    hunt.pressure.outOfControl = true;
    await this._onPressureOutOfControl(hunt);
  }

  await game.settings.set('cain', 'currentHunt', hunt);
  this._emitUpdate();
  await this._promptTensionMove();
};

HuntTracker.prototype._incrementPressure = async function(source) {
  const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
  hunt.pressure.current++;
  hunt.execution.calculated = 6 + hunt.pressure.current + hunt.sinCategory;

  if (hunt.pressure.current >= hunt.pressure.max && !hunt.pressure.outOfControl) {
    hunt.pressure.outOfControl = true;
    await this._onPressureOutOfControl(hunt);
  }

  await game.settings.set('cain', 'currentHunt', hunt);
  this._emitUpdate();
};

HuntTracker.prototype._onPressureOutOfControl = async function(hunt) {
  ChatMessage.create({
    speaker: { alias: "CAIN System" },
    content: `<div class="hunt-message pressure-overflow">
      <h2>PRESSURE OVERFLOW</h2>
      <p>The situation has gone out of control!</p>
      <p>The Sin gains <strong>+1 CAT</strong> and activates its overflow effect.</p>
      <p>Check the Sin's pressure description for specific effects.</p>
    </div>`
  });
};

HuntTracker.prototype._promptTensionMove = async function() {
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
};

HuntTracker.prototype._sinRetreats = async function() {
  const hunt = foundry.utils.deepClone(game.settings.get('cain', 'currentHunt'));
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
};

HuntTracker.prototype._sinDefeated = async function() {
  ChatMessage.create({
    speaker: { alias: "CAIN System" },
    content: `<div class="hunt-message sin-defeated">
      <h2>SIN EXECUTED</h2>
      <p>The Sin has been destroyed!</p>
      <p>Proceed to exfiltration phase.</p>
    </div>`
  });
};

export default HuntTracker;
