import { CainDiceRoller } from './cain-dice-roller.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// Default position if no saved position exists
const DEFAULT_POSITION = { top: 100, left: 100 };

/**
 * CainDicePanel - ApplicationV2-based dice roller window
 * Provides a draggable, always-accessible dice roller for the CAIN system
 */
export class CainDicePanel extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: 'div',
    id: 'cain-dice-panel',
    classes: ['cain-dice-panel-window'],
    window: {
      title: 'CAIN Dice Roller',
      icon: 'fa-solid fa-brain',
      positioned: true,
      minimizable: true,
      resizable: false,
    },
    position: {
      top: DEFAULT_POSITION.top,
      left: DEFAULT_POSITION.left,
      width: 300,
      height: 'auto',
    }
  };

  static PARTS = {
    panel: {
      template: 'systems/cain/templates/dice/dice-panel-app.hbs'
    }
  };

  /**
   * Available themes for the dice panel
   */
  static THEMES = ['purple', 'dark', 'light', 'blood'];

  /**
   * Current theme
   */
  _currentTheme = 'purple';

  /**
   * Track if body is collapsed
   */
  _isCollapsed = false;

  /**
   * Track selected character ID
   */
  _selectedCharacterId = null;

  /**
   * Track selected skill
   */
  _selectedSkill = 'force';

  /**
   * Track dice pool value
   */
  _dicePoolValue = 1;

  // ==================== INITIALIZATION ====================

  /**
   * Initialize the dice panel system
   * Called during system init hook
   */
  static init() {
    // Initialize CONFIG storage
    CONFIG.CAIN = CONFIG.CAIN || {};

    // Register hooks for actor changes
    Hooks.on('createActor', () => {
      if (ui.cainDicePanel?.rendered) ui.cainDicePanel.render();
    });
    Hooks.on('deleteActor', () => {
      if (ui.cainDicePanel?.rendered) ui.cainDicePanel.render();
    });
    Hooks.on('updateActor', (_actor, changes) => {
      if (changes.name || changes.system?.divineAgony !== undefined) {
        if (ui.cainDicePanel?.rendered) ui.cainDicePanel.render();
      }
    });

    // Create the panel instance on ready
    Hooks.once('ready', () => {
      const panel = new CainDicePanel();
      ui.cainDicePanel = panel;
      CONFIG.CAIN.dicePanel = panel;

      // Load saved theme
      const savedTheme = game.settings?.get('cain', 'dicePanelTheme') ?? 'purple';
      panel._currentTheme = savedTheme;

      // Load saved collapsed state
      const savedCollapsed = game.settings?.get('cain', 'dicePanelCollapsed') ?? false;
      panel._isCollapsed = savedCollapsed;

      // Load saved selected character
      const savedCharacter = game.settings?.get('cain', 'dicePanelSelectedCharacter') ?? '';
      panel._selectedCharacterId = savedCharacter || null;

      // Load saved selected skill
      const savedSkill = game.settings?.get('cain', 'dicePanelSelectedSkill') ?? 'force';
      panel._selectedSkill = savedSkill;

      // Check if dice roller should be shown (master setting must be enabled)
      const showDiceRoller = game.settings?.get('cain', 'showDiceRoller') ?? true;
      // Load saved open/closed state (for scene control toggle)
      const savedOpen = game.settings?.get('cain', 'dicePanelOpen') ?? true;

      // Only show if both master setting is enabled AND user hasn't closed it
      if (showDiceRoller && savedOpen) {
        panel.render(true);
      }

      console.log('CAIN | Dice Panel initialized');
    });

    // Add scene control button (v12 and v13 compatible)
    Hooks.on('getSceneControlButtons', (controls) => {
      const isV13 = game.release?.generation >= 13;

      if (isV13) {
        // v13: controls is an object keyed by control name (plural: "tokens")
        if (controls.tokens) {
          controls.tokens.tools['cain-dice-roller'] = {
            name: 'cain-dice-roller',
            title: 'CAIN Dice Roller',
            icon: 'fa-solid fa-brain',
            button: true,
            onClick: () => {
              if (ui.cainDicePanel) {
                if (ui.cainDicePanel.rendered) {
                  ui.cainDicePanel.close();
                  // Save closed state
                  game.settings?.set('cain', 'dicePanelOpen', false);
                } else {
                  ui.cainDicePanel.render(true);
                  // Save open state
                  game.settings?.set('cain', 'dicePanelOpen', true);
                }
              }
            }
          };
        }
      } else {
        // v12: controls is an array, name is "token" (singular)
        const tokenControls = controls.find(c => c.name === 'token');
        if (tokenControls) {
          tokenControls.tools.push({
            name: 'cain-dice-roller',
            title: 'CAIN Dice Roller',
            icon: 'fa-solid fa-brain',
            button: true,
            onClick: () => {
              if (ui.cainDicePanel) {
                if (ui.cainDicePanel.rendered) {
                  ui.cainDicePanel.close();
                  // Save closed state
                  game.settings?.set('cain', 'dicePanelOpen', false);
                } else {
                  ui.cainDicePanel.render(true);
                  // Save open state
                  game.settings?.set('cain', 'dicePanelOpen', true);
                }
              }
            }
          });
        }
      }
    });
  }

  // ==================== LIFECYCLE ====================

  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);

    // Load saved position
    const savedPosition = game.settings?.get('cain', 'dicePanelPosition');
    if (savedPosition?.top !== undefined && savedPosition?.left !== undefined) {
      this.setPosition(savedPosition);
    }

    // Save open state when window is first rendered
    game.settings?.set('cain', 'dicePanelOpen', true);
  }

  async _onClose(options) {
    await super._onClose(options);

    // Save closed state when window is closed via X button or other means
    game.settings?.set('cain', 'dicePanelOpen', false);
  }

  setPosition(position) {
    const result = super.setPosition(position);

    // Save position when moved
    if (position && (position.top !== undefined || position.left !== undefined)) {
      if (this._positionSaveTimeout) {
        clearTimeout(this._positionSaveTimeout);
      }
      this._positionSaveTimeout = setTimeout(() => {
        const currentPos = this.position;
        if (currentPos.top !== undefined && currentPos.left !== undefined) {
          game.settings.set('cain', 'dicePanelPosition', {
            top: currentPos.top,
            left: currentPos.left
          });
        }
      }, 100);
    }

    return result;
  }

  // ==================== DATA PREPARATION ====================

  async _preparePartContext(partId, context) {
    context = await super._preparePartContext(partId, context);

    // Skills list
    context.skills = CainDiceRoller.SKILLS.map(s => ({
      key: s,
      label: s.charAt(0).toUpperCase() + s.slice(1)
    }));

    // Character list
    context.characters = this._getCharacterList();
    context.isGM = game.user?.isGM ?? false;
    context.selectedCharacterId = this._selectedCharacterId;
    context.selectedSkill = this._selectedSkill;
    context.dicePoolValue = this._dicePoolValue;

    // Current theme
    context.theme = this._currentTheme;
    context.isCollapsed = this._isCollapsed;

    // Selected character info
    const selectedActor = this._getSelectedActor();
    if (selectedActor?.system?.divineAgony) {
      context.divineAgony = {
        current: selectedActor.system.divineAgony.value || 0,
        max: selectedActor.system.divineAgony.max || 3,
        available: (selectedActor.system.divineAgony.value || 0) > 0
      };
    } else {
      context.divineAgony = null;
    }

    return context;
  }

  _getCharacterList() {
    if (game.user?.isGM) {
      return game.actors?.filter(a => a.type === 'character').map(a => ({
        id: a.id,
        name: a.name
      })) || [];
    } else {
      return game.actors?.filter(a => a.type === 'character' && a.isOwner).map(a => ({
        id: a.id,
        name: a.name
      })) || [];
    }
  }

  // ==================== EVENT HANDLERS ====================

  _onRender(context, options) {
    super._onRender(context, options);

    const html = this.element;
    if (!html) return;

    // Apply theme
    this._applyTheme(html);

    // Bind all event listeners
    this._bindEventListeners(html);
  }

  _bindEventListeners(html) {
    // Collapse toggle
    html.querySelector('.cain-panel-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._isCollapsed = !this._isCollapsed;
      // Save collapsed state
      game.settings?.set('cain', 'dicePanelCollapsed', this._isCollapsed);
      this.render();
    });

    // Theme toggle - bind to ALL theme toggle buttons
    html.querySelectorAll('.cain-theme-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._cycleTheme();
      });
    });

    // Main roll button
    html.querySelector('.cain-roll-skill')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleSkillRoll();
    });

    // Quick roll buttons
    html.querySelector('.cain-roll-risk')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleRiskRoll();
    });

    html.querySelector('.cain-roll-fate')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleFateRoll();
    });

    html.querySelector('.cain-roll-rest')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleRestRoll();
    });

    html.querySelector('.cain-roll-custom')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleCustomRoll();
    });

    // Dice pool +/- buttons
    html.querySelector('.cain-pool-minus')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._dicePoolValue = Math.max(-1, this._dicePoolValue - 1);
      const poolInput = html.querySelector('.cain-dice-pool');
      if (poolInput) poolInput.value = this._dicePoolValue;
    });

    html.querySelector('.cain-pool-plus')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._dicePoolValue = Math.min(10, this._dicePoolValue + 1);
      const poolInput = html.querySelector('.cain-dice-pool');
      if (poolInput) poolInput.value = this._dicePoolValue;
    });

    // Dice pool manual input
    html.querySelector('.cain-dice-pool')?.addEventListener('change', (e) => {
      this._dicePoolValue = parseInt(e.target.value) || 1;
    });

    // Character select change
    html.querySelector('.cain-character-select')?.addEventListener('change', (e) => {
      this._selectedCharacterId = e.target.value || null;
      // Save selected character
      game.settings?.set('cain', 'dicePanelSelectedCharacter', this._selectedCharacterId || '');
      this._updateDicePoolFromActor();
    });

    // Skill select change
    html.querySelector('.cain-skill-select')?.addEventListener('change', (e) => {
      this._selectedSkill = e.target.value || 'force';
      // Save selected skill
      game.settings?.set('cain', 'dicePanelSelectedSkill', this._selectedSkill);
      this._updateDicePoolFromActor();
    });

    // Enter key to roll
    html.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._handleSkillRoll();
        }
      });
    });
  }

  // ==================== THEME MANAGEMENT ====================

  _applyTheme(html) {
    const panel = html.querySelector('.cain-dice-panel') || html;

    // Apply theme to inner panel
    if (this._currentTheme === 'purple') {
      panel.removeAttribute('data-theme');
    } else {
      panel.setAttribute('data-theme', this._currentTheme);
    }

    // Apply theme class to window element for window styling
    const windowEl = this.element;
    if (windowEl) {
      // Remove all theme classes
      windowEl.classList.remove('theme-purple', 'theme-dark', 'theme-light', 'theme-blood');
      // Add current theme class (skip for purple as it's the default)
      if (this._currentTheme !== 'purple') {
        windowEl.classList.add(`theme-${this._currentTheme}`);
      }
    }
  }

  _cycleTheme() {
    const currentIndex = CainDicePanel.THEMES.indexOf(this._currentTheme);
    const nextIndex = (currentIndex + 1) % CainDicePanel.THEMES.length;
    this._currentTheme = CainDicePanel.THEMES[nextIndex];

    // Save theme
    game.settings?.set('cain', 'dicePanelTheme', this._currentTheme);

    // Re-render to apply
    this.render();

    ui.notifications?.info(`Dice Panel Theme: ${this._currentTheme.charAt(0).toUpperCase() + this._currentTheme.slice(1)}`);
  }

  // ==================== DICE ROLLING ====================

  _getPanelValues() {
    const html = this.element;
    if (!html) return {};

    // Parse pool value carefully - 0 is a valid value for zero-dice rolls
    const poolInput = html.querySelector('.cain-dice-pool')?.value;
    const poolValue = poolInput !== '' && poolInput !== undefined ? parseInt(poolInput) : 1;

    return {
      skill: html.querySelector('.cain-skill-select')?.value || 'force',
      pool: isNaN(poolValue) ? 1 : poolValue,
      extraDice: parseInt(html.querySelector('.cain-extra-dice')?.value) || 0,
      hard: html.querySelector('.cain-hard-roll')?.checked || false,
      whisper: html.querySelector('.cain-whisper')?.checked || false,
      useDivineAgony: html.querySelector('.cain-use-divine-agony')?.checked || false
    };
  }

  _getSelectedActor() {
    // Use stored character ID first
    if (this._selectedCharacterId) {
      const actor = game.actors?.get(this._selectedCharacterId);
      if (actor) return actor;
    }

    // Fallback to controlled token or user's character
    const controlled = canvas?.tokens?.controlled;
    if (controlled?.length === 1) {
      return controlled[0].actor;
    }
    return game.user?.character;
  }

  async _handleSkillRoll() {
    const values = this._getPanelValues();
    const actor = this._getSelectedActor();

    // Calculate divine agony bonus if enabled
    let divineAgonyBonus = 0;
    if (values.useDivineAgony && actor?.system?.divineAgony) {
      divineAgonyBonus = actor.system.divineAgony.value || 0;
      if (divineAgonyBonus > 0) {
        await actor.update({ 'system.divineAgony.value': 0 });
      }
    }

    let result;
    if (values.skill === 'psyche') {
      result = await CainDiceRoller.rollPsyche({
        psyche: values.pool,
        extraDice: values.extraDice + divineAgonyBonus,
        hard: values.hard,
        actor,
        whisper: values.whisper,
        usedDivineAgony: divineAgonyBonus > 0 ? divineAgonyBonus : null
      });
    } else {
      result = await CainDiceRoller.rollSkill({
        skill: values.skill,
        pool: values.pool,
        extraDice: values.extraDice + divineAgonyBonus,
        hard: values.hard,
        actor,
        whisper: values.whisper,
        usedDivineAgony: divineAgonyBonus > 0 ? divineAgonyBonus : null
      });
    }

    // On failed roll, increment divine agony
    if (result && result.successes === 0 && actor?.system?.divineAgony) {
      const currentAgony = actor.system.divineAgony.value;
      const maxAgony = actor.system.divineAgony.max;
      if (currentAgony < maxAgony) {
        await actor.update({ 'system.divineAgony.value': currentAgony + 1 });
      }
    }

    // Uncheck divine agony and re-render
    this.render();
  }

  async _handleRiskRoll() {
    const values = this._getPanelValues();
    await CainDiceRoller.rollRisk({
      actor: this._getSelectedActor(),
      whisper: values.whisper
    });
  }

  async _handleFateRoll() {
    const values = this._getPanelValues();
    await CainDiceRoller.rollFate({
      actor: this._getSelectedActor(),
      whisper: values.whisper
    });
  }

  async _handleRestRoll() {
    const values = this._getPanelValues();
    const actor = this._getSelectedActor();
    await CainDiceRoller.rollRest({
      modifier: actor?.system?.restDiceModifier || 0,
      actor,
      whisper: values.whisper
    });
  }

  async _handleCustomRoll() {
    const values = this._getPanelValues();
    const actor = this._getSelectedActor();

    new Dialog({
      title: 'Custom Roll',
      content: `
        <form class="cain-custom-roll-dialog">
          <div class="form-group">
            <label>Formula</label>
            <input type="text" name="formula" placeholder="2d6+3" autofocus/>
          </div>
          <div class="form-group">
            <label>Label</label>
            <input type="text" name="label" value="Custom Roll"/>
          </div>
        </form>
      `,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: 'Roll',
          callback: async (html) => {
            const form = html[0].querySelector('form');
            const formula = form.querySelector('[name="formula"]')?.value;
            const label = form.querySelector('[name="label"]')?.value || 'Custom Roll';

            if (!formula) {
              ui.notifications.warn('Enter a dice formula');
              return;
            }

            await CainDiceRoller.rollCustom({
              formula,
              label,
              actor,
              whisper: values.whisper
            });
          }
        },
        cancel: { label: 'Cancel' }
      },
      default: 'roll'
    }).render(true);
  }

  _updateDicePoolFromActor() {
    const actor = this._getSelectedActor();
    if (!actor) return;

    const skill = this._selectedSkill;

    let poolValue = 1;
    if (skill === 'psyche') {
      poolValue = actor.system?.psyche ?? 1;
    } else if (actor.system?.skills?.[skill]) {
      poolValue = actor.system.skills[skill].value ?? 1;
    }

    // Store the pool value
    this._dicePoolValue = poolValue;

    // Re-render to update divine agony display and pool value
    this.render();
  }
}

// Legacy export for backwards compatibility
export const CainChatDicePanel = {
  init: () => CainDicePanel.init()
};
