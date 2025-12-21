import { CainDiceRoller } from './cain-dice-roller.mjs';

/**
 * CainChatDicePanel - Adds a dice roller panel to the chat sidebar
 * Compatible with Foundry VTT v11, v12, and v13
 *
 * Pattern based on fvtt-dice-tray by mclemente
 * Uses CONFIG.CAIN.dicePanel to store the element reference
 */
export class CainChatDicePanel {
  static TEMPLATE = 'systems/cain/templates/dice/chat-dice-panel.hbs';
  static ID = 'cain-dice-panel';

  /**
   * Initialize the dice panel
   * Should be called during system init hook
   */
  static async init() {
    // Initialize CONFIG storage
    CONFIG.CAIN = CONFIG.CAIN || {};
    CONFIG.CAIN.dicePanel = {
      element: null,
      rendered: false
    };

    // Create panel element when game is ready (game.user and actors are available)
    Hooks.once('ready', async () => {
      await this._createPanelElement();
      this._refreshCharacterSelect();
      // Try to position the panel after creation
      // Only the first attempt uses forceMove, retries check if already in place
      if (!this._moveDicePanel(false)) {
        // Retry after a short delay in case DOM wasn't ready (v12)
        setTimeout(() => {
          if (!this._isPanelInPlace()) this._moveDicePanel(false);
        }, 500);
        // Final retry for slow-loading v12 instances
        setTimeout(() => {
          if (!this._isPanelInPlace()) this._moveDicePanel(false);
        }, 1500);
      }
    });

    // Refresh character select when actors change
    Hooks.on('createActor', () => this._refreshCharacterSelect());
    Hooks.on('deleteActor', () => this._refreshCharacterSelect());
    Hooks.on('updateActor', (_actor, changes) => {
      // Refresh if name changed
      if (changes.name) this._refreshCharacterSelect();
      // Also refresh divine agony display if divineAgony changed
      if (changes.system?.divineAgony !== undefined) {
        if (CONFIG.CAIN?.dicePanel?.element) {
          this._updateDicePoolFromActor(CONFIG.CAIN.dicePanel.element);
        }
      }
    });

    // Position the panel when chat renders (initial placement)
    // v12 and earlier: renderChatLog fires but DOM may not be ready
    Hooks.on('renderChatLog', () => {
      // Delay slightly to ensure DOM is ready (especially for v12)
      setTimeout(() => this._moveDicePanel(false), 100);
    });

    // Handle sidebar collapse - need to reposition
    Hooks.on('collapseSidebar', () => this._moveDicePanel(false));

    // v13+ hook: fires when chat input is re-parented between sidebar and notification overlay
    // This is the main case where we need to actually move the panel
    Hooks.on('renderChatInput', () => {
      // Small delay to ensure DOM is settled after re-parenting
      setTimeout(() => this._moveDicePanel(true), 50);
    });

    // v11/v12 fallback: renderSidebarTab fires when switching tabs
    // This helps ensure the panel is positioned when chat tab is activated
    Hooks.on('renderSidebarTab', (app) => {
      if (app.id === 'chat' || app.tabName === 'chat') {
        setTimeout(() => this._moveDicePanel(false), 100);
      }
    });

    console.log('CAIN | Dice Panel initialized');
  }

  /**
   * Refresh the character select dropdown
   * Called when game is ready or actors change
   * @private
   */
  static _refreshCharacterSelect() {
    if (!CONFIG.CAIN?.dicePanel?.element) return;
    const element = CONFIG.CAIN.dicePanel.element;
    const select = element.querySelector('.cain-character-select');
    if (select) {
      this._populateCharacterSelect(select);
    }
    // Also refresh divine agony display
    this._updateDicePoolFromActor(element);
  }

  /**
   * Create the panel element once and store it
   * @private
   */
  static async _createPanelElement() {
    // Ensure CONFIG.CAIN.dicePanel exists
    CONFIG.CAIN = CONFIG.CAIN || {};
    CONFIG.CAIN.dicePanel = CONFIG.CAIN.dicePanel || { element: null, rendered: false };

    const templateData = {
      skills: CainDiceRoller.SKILLS.map(s => ({
        key: s,
        label: s.charAt(0).toUpperCase() + s.slice(1)
      })),
      isGM: game.user?.isGM ?? false
    };

    // Use v13 namespaced renderTemplate with fallback for v11/v12
    const renderTemplateFn = foundry?.applications?.handlebars?.renderTemplate ?? renderTemplate;

    let html;
    try {
      html = await renderTemplateFn(this.TEMPLATE, templateData);
    } catch (e) {
      console.error('CAIN | Failed to render dice panel template:', e);
      html = this._getFallbackHTML(templateData);
    }

    // Create element from HTML string
    const container = document.createElement('div');
    container.innerHTML = html.trim();
    const element = container.firstElementChild;

    // Store in CONFIG
    CONFIG.CAIN.dicePanel.element = element;
    CONFIG.CAIN.dicePanel.rendered = true;

    // Attach event listeners
    this._activateListeners(element);

    // Check user preference for visibility
    this._updateVisibility();

    // Apply saved theme
    this._applyTheme(element);

    console.log('CAIN | Dice panel element created');
  }

  /**
   * Update panel visibility based on user setting
   * @private
   */
  static _updateVisibility() {
    if (!CONFIG.CAIN?.dicePanel?.element) return;

    const showDiceRoller = game.settings?.get('cain', 'showDiceRoller') ?? true;
    CONFIG.CAIN.dicePanel.element.classList.toggle('hidden', !showDiceRoller);
  }

  /**
   * Apply saved theme to the panel
   * @private
   */
  static _applyTheme(element) {
    const theme = game.settings?.get('cain', 'dicePanelTheme') ?? 'purple';
    // Purple is default (no data-theme attribute needed)
    if (theme === 'purple') {
      element.removeAttribute('data-theme');
    } else {
      element.setAttribute('data-theme', theme);
    }
  }

  /**
   * Cycle through available themes
   * @private
   */
  static _cycleTheme(element) {
    const currentTheme = element.getAttribute('data-theme') || 'purple';
    const currentIndex = this.THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % this.THEMES.length;
    const nextTheme = this.THEMES[nextIndex];

    // Apply the theme
    if (nextTheme === 'purple') {
      element.removeAttribute('data-theme');
    } else {
      element.setAttribute('data-theme', nextTheme);
    }

    // Save to settings
    game.settings?.set('cain', 'dicePanelTheme', nextTheme);

    // Show notification
    ui.notifications?.info(`Dice Panel Theme: ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}`);
  }

  /**
   * Check if the panel is already in place in the DOM
   * @returns {boolean} True if panel is in the DOM and visible
   * @private
   */
  static _isPanelInPlace() {
    const element = CONFIG.CAIN?.dicePanel?.element;
    if (!element) return false;
    // Check if element is in the document and has a parent
    return element.isConnected && element.parentElement !== null;
  }

  /**
   * Move the dice panel to the correct position in chat
   * Only moves if the panel needs to be relocated
   * @param {boolean} forceMove - If true, always move even if parent seems the same
   * @returns {boolean} True if panel was successfully placed
   * @private
   */
  static _moveDicePanel(forceMove = false) {
    if (!CONFIG.CAIN?.dicePanel?.element) return false;

    const element = CONFIG.CAIN.dicePanel.element;

    // Find the chat message input - try multiple selectors for v11/v12/v13 compatibility
    let chatInput = document.getElementById('chat-message');

    // v12 fallback: try finding by selector within sidebar
    if (!chatInput) {
      chatInput = document.querySelector('#sidebar #chat textarea[name="message"]');
    }
    // Another v12 fallback
    if (!chatInput) {
      chatInput = document.querySelector('#chat-form textarea');
    }
    // Generic fallback
    if (!chatInput) {
      chatInput = document.querySelector('#chat textarea');
    }

    if (!chatInput) {
      console.log('CAIN | Dice panel: chat input not found, will retry...');
      return false;
    }

    // Find the best insertion point - always insert AFTER the chat form (below the message input)
    let chatForm = chatInput.closest('form');
    if (!chatForm) {
      chatForm = chatInput.closest('#chat-form');
    }
    if (!chatForm) {
      chatForm = chatInput.parentElement;
    }
    if (!chatForm) return false;

    // For v12: Check if we should insert into the #chat container instead
    // This prevents flex container issues where the panel stretches
    const chatContainer = document.getElementById('chat');
    let insertTarget = chatForm;
    let insertMethod = 'afterend';

    // In v12, the #chat container is the better parent
    // Check if form's parent is #chat (v12 structure)
    if (chatForm.parentElement?.id === 'chat') {
      insertTarget = chatContainer;
      insertMethod = 'beforeend'; // Append to end of #chat
    }

    // Check if we're in the notification overlay (v13 mini chat)
    const isInNotificationOverlay = chatInput.closest('.chat-notifications') !== null
      || chatInput.closest('#chat-notifications') !== null
      || chatInput.closest('[class*="notification"]') !== null;

    // Check if the panel is already in the correct position
    const alreadyInPlace = element.parentElement === insertTarget ||
      (insertMethod === 'afterend' && insertTarget.nextElementSibling === element) ||
      (insertMethod === 'beforeend' && insertTarget.lastElementChild === element);

    // Check if overlay state changed
    const wasInOverlay = element.classList.contains('in-notification-overlay');
    const overlayStateChanged = wasInOverlay !== isInNotificationOverlay;

    // Only move if necessary
    if (!alreadyInPlace || overlayStateChanged || forceMove) {
      // Update overlay class (no transition animation needed)
      element.classList.toggle('in-notification-overlay', isInNotificationOverlay);

      // Move the element using the appropriate method
      if (insertMethod === 'beforeend') {
        insertTarget.appendChild(element);
      } else {
        insertTarget.insertAdjacentElement('afterend', element);
      }

      console.log('CAIN | Dice panel moved, method:', insertMethod, ', in notification overlay:', isInNotificationOverlay);
    }

    return true;
  }

  /**
   * Fallback HTML if template fails to load
   * @private
   */
  static _getFallbackHTML(data) {
    const skillOptions = data.skills.map(s =>
      `<option value="${s.key}">${s.label}</option>`
    ).join('');

    // Quick rolls are now available to all users
    const quickRolls = `
        <button type="button" class="cain-roll-risk" title="Risk Roll">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Risk</span>
        </button>
        <button type="button" class="cain-roll-fate" title="Fate Roll">
          <i class="fas fa-star"></i>
          <span>Fate</span>
        </button>
        <button type="button" class="cain-roll-custom" title="Custom Roll">
          <i class="fas fa-cog"></i>
          <span>Custom</span>
        </button>
    `;

    return `
      <div id="${this.ID}" class="cain-dice-panel">
        <div class="cain-dice-panel-header">
          <img src="systems/cain/assets/brain.png" class="cain-dice-icon"/>
          <span>DICE ROLLER</span>
          <button type="button" class="cain-theme-toggle" title="Change Theme">
            <i class="fas fa-palette"></i>
          </button>
          <button type="button" class="cain-panel-toggle" title="Toggle">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
        <div class="cain-dice-panel-body">
          <div class="cain-dice-row">
            <label>${data.isGM ? 'Player:' : 'Char:'}</label>
            <select class="cain-character-select">
              <option value="">-- Select --</option>
            </select>
          </div>
          <div class="cain-dice-row">
            <select class="cain-skill-select">
              ${skillOptions}
              <option value="psyche">Psyche</option>
            </select>
            <div class="cain-dice-pool-controls">
              <button type="button" class="cain-pool-minus" title="Decrease Dice Pool">-</button>
              <input type="number" class="cain-dice-pool" value="1" min="-1" max="10"/>
              <button type="button" class="cain-pool-plus" title="Increase Dice Pool">+</button>
            </div>
          </div>
          <div class="cain-dice-row cain-modifiers">
            <label><input type="number" class="cain-extra-dice" value="0" min="-5" max="5"/><span>+/-</span></label>
            <label><input type="checkbox" class="cain-hard-roll"/><span>Hard</span></label>
            <label><input type="checkbox" class="cain-whisper"/><span>GM</span></label>
          </div>
          <div class="cain-dice-row cain-divine-agony-row disabled">
            <label class="cain-divine-agony-label">
              <input type="checkbox" class="cain-use-divine-agony" disabled/>
              <span class="cain-divine-agony-text">
                <i class="fas fa-fire-alt"></i>
                Divine Agony
              </span>
              <span class="cain-divine-agony-value" title="Select a character to use Divine Agony">-</span>
            </label>
          </div>
          <div class="cain-dice-row">
            <button type="button" class="cain-roll-skill"><i class="fas fa-dice-d6"></i> ROLL</button>
          </div>
          <div class="cain-dice-row cain-quick-rolls">
            <button type="button" class="cain-roll-rest" title="Rest Dice (2d3)">
              <i class="fas fa-bed"></i>
              <span>Rest</span>
            </button>
            ${quickRolls}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to the panel element
   * @private
   */
  /**
   * Available themes for the dice panel
   */
  static THEMES = ['purple', 'dark', 'light', 'blood'];

  static _activateListeners(element) {
    // Toggle panel
    element.querySelector('.cain-panel-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      element.classList.toggle('collapsed');
      const icon = element.querySelector('.cain-panel-toggle i');
      icon?.classList.toggle('fa-chevron-up');
      icon?.classList.toggle('fa-chevron-down');
    });

    // Theme toggle button
    element.querySelector('.cain-theme-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._cycleTheme(element);
    });

    // Main roll button
    element.querySelector('.cain-roll-skill')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleSkillRoll(element);
    });

    // Quick roll buttons
    element.querySelector('.cain-roll-risk')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleRiskRoll(element);
    });

    element.querySelector('.cain-roll-fate')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleFateRoll(element);
    });

    // Rest dice roll button
    element.querySelector('.cain-roll-rest')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleRestRoll(element);
    });

    // Custom roll button (GM only)
    element.querySelector('.cain-roll-custom')?.addEventListener('click', (e) => {
      e.preventDefault();
      this._handleCustomRoll(element);
    });

    // Enter key to roll in number inputs
    element.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this._handleSkillRoll(element);
        }
      });
    });

    // Dice pool +/- buttons
    element.querySelector('.cain-pool-minus')?.addEventListener('click', (e) => {
      e.preventDefault();
      const poolInput = element.querySelector('.cain-dice-pool');
      if (poolInput) {
        const current = parseInt(poolInput.value) || 0;
        // Allow going down to -1 (triggers zero-dice roll)
        poolInput.value = Math.max(-1, current - 1);
      }
    });

    element.querySelector('.cain-pool-plus')?.addEventListener('click', (e) => {
      e.preventDefault();
      const poolInput = element.querySelector('.cain-dice-pool');
      if (poolInput) {
        const current = parseInt(poolInput.value) || 0;
        poolInput.value = Math.min(10, current + 1);
      }
    });

    // Update dice pool when skill changes (if actor selected)
    element.querySelector('.cain-skill-select')?.addEventListener('change', () => {
      this._updateDicePoolFromActor(element);
    });

    // Character select change handler (population happens on 'ready' hook)
    const characterSelect = element.querySelector('.cain-character-select');
    if (characterSelect) {
      characterSelect.addEventListener('change', () => {
        this._updateDicePoolFromActor(element);
      });
    }
  }

  /**
   * Populate the character select dropdown
   * For GM: shows all characters
   * For players: shows only characters they own
   * @private
   */
  static _populateCharacterSelect(select) {
    // Clear existing options except the first
    while (select.options.length > 1) {
      select.remove(1);
    }

    let characters;
    if (game.user?.isGM) {
      // GM sees all character actors
      characters = game.actors?.filter(a => a.type === 'character') || [];
    } else {
      // Players see only characters they own
      characters = game.actors?.filter(a =>
        a.type === 'character' && a.isOwner
      ) || [];
    }

    for (const actor of characters) {
      const option = document.createElement('option');
      option.value = actor.id;
      option.textContent = actor.name;
      select.appendChild(option);
    }

    // Auto-select user's character if they only have one
    if (!game.user?.isGM && characters.length === 1) {
      select.value = characters[0].id;
      // Trigger update
      this._updateDicePoolFromActor(select.closest('.cain-dice-panel'));
    }
  }

  /**
   * Get values from the panel
   * @private
   */
  static _getPanelValues(element) {
    return {
      skill: element.querySelector('.cain-skill-select')?.value || 'violence',
      pool: parseInt(element.querySelector('.cain-dice-pool')?.value) || 1,
      extraDice: parseInt(element.querySelector('.cain-extra-dice')?.value) || 0,
      teamwork: element.querySelector('.cain-teamwork')?.checked || false,
      setup: element.querySelector('.cain-setup')?.checked || false,
      hard: element.querySelector('.cain-hard-roll')?.checked || false,
      whisper: element.querySelector('.cain-whisper')?.checked || false,
      useDivineAgony: element.querySelector('.cain-use-divine-agony')?.checked || false
    };
  }

  /**
   * Handle skill/psyche roll
   * @private
   */
  static async _handleSkillRoll(element) {
    const values = this._getPanelValues(element);
    const actor = this._getSelectedActor();

    // Calculate divine agony bonus if enabled and actor is selected
    let divineAgonyBonus = 0;
    if (values.useDivineAgony && actor?.system?.divineAgony) {
      divineAgonyBonus = actor.system.divineAgony.value || 0;
      // Reset divine agony to 0 when used
      if (divineAgonyBonus > 0) {
        await actor.update({ 'system.divineAgony.value': 0 });
        // Update the display
        this._updateDivineAgonyDisplay(element, actor);
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
        teamwork: values.teamwork,
        setup: values.setup,
        hard: values.hard,
        actor,
        whisper: values.whisper,
        usedDivineAgony: divineAgonyBonus > 0 ? divineAgonyBonus : null
      });
    }

    // On failed roll (0 successes), increment divine agony (if actor has one and not at max)
    if (result && result.successes === 0 && actor?.system?.divineAgony) {
      const currentAgony = actor.system.divineAgony.value;
      const maxAgony = actor.system.divineAgony.max;
      if (currentAgony < maxAgony) {
        await actor.update({ 'system.divineAgony.value': currentAgony + 1 });
        // Update the display
        this._updateDivineAgonyDisplay(element, actor);
      }
    }

    // Uncheck divine agony checkbox after rolling
    const divineAgonyCheckbox = element.querySelector('.cain-use-divine-agony');
    if (divineAgonyCheckbox) {
      divineAgonyCheckbox.checked = false;
    }
  }

  /**
   * Handle risk roll
   * @private
   */
  static async _handleRiskRoll(element) {
    const values = this._getPanelValues(element);
    await CainDiceRoller.rollRisk({
      actor: this._getSelectedActor(),
      whisper: values.whisper
    });
  }

  /**
   * Handle fate roll
   * @private
   */
  static async _handleFateRoll(element) {
    const values = this._getPanelValues(element);
    await CainDiceRoller.rollFate({
      actor: this._getSelectedActor(),
      whisper: values.whisper
    });
  }

  /**
   * Handle rest roll
   * @private
   */
  static async _handleRestRoll(element) {
    const values = this._getPanelValues(element);
    const actor = this._getSelectedActor();
    await CainDiceRoller.rollRest({
      modifier: actor?.system?.restDiceModifier || 0,
      actor,
      whisper: values.whisper
    });
  }

  /**
   * Handle custom roll (GM only)
   * @private
   */
  static async _handleCustomRoll(element) {
    const values = this._getPanelValues(element);
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

  /**
   * Get currently selected actor
   * @private
   */
  static _getSelectedActor() {
    // Check if a character is selected in the dropdown (works for both GM and players)
    const characterSelect = CONFIG.CAIN?.dicePanel?.element?.querySelector('.cain-character-select');
    const selectedId = characterSelect?.value;
    if (selectedId) {
      const actor = game.actors?.get(selectedId);
      if (actor) return actor;
    }

    // Check controlled tokens first
    const controlled = canvas?.tokens?.controlled;
    if (controlled?.length === 1) {
      return controlled[0].actor;
    }
    // Fall back to user's character
    return game.user?.character;
  }

  /**
   * Update dice pool from selected actor
   * @private
   */
  static _updateDicePoolFromActor(element) {
    // Get actor from the element's character select, not from CONFIG
    const characterSelect = element.querySelector('.cain-character-select');
    const selectedId = characterSelect?.value;

    let actor = null;
    if (selectedId) {
      actor = game.actors?.get(selectedId);
    }

    // Fall back to controlled token or user's character
    if (!actor) {
      const controlled = canvas?.tokens?.controlled;
      if (controlled?.length === 1) {
        actor = controlled[0].actor;
      } else {
        actor = game.user?.character;
      }
    }

    if (!actor) {
      // No actor selected - hide divine agony display
      this._updateDivineAgonyDisplay(element, null);
      return;
    }

    const skill = element.querySelector('.cain-skill-select')?.value;
    const poolInput = element.querySelector('.cain-dice-pool');
    if (!poolInput) return;

    let poolValue = 1;
    if (skill === 'psyche') {
      // Allow 0 as a valid value (triggers zero-dice roll)
      poolValue = actor.system?.psyche ?? 1;
    } else if (actor.system?.skills?.[skill]) {
      // Allow 0 as a valid value (triggers zero-dice roll)
      poolValue = actor.system.skills[skill].value ?? 1;
    }

    // If the pool is 0, set to 0 in the input (not -1, the dice roller handles 0 and below)
    poolInput.value = poolValue;

    // Update divine agony display
    this._updateDivineAgonyDisplay(element, actor);
  }

  /**
   * Update the divine agony display value
   * @private
   */
  static _updateDivineAgonyDisplay(element, actor) {
    const valueDisplay = element?.querySelector('.cain-divine-agony-value');
    const divineAgonyRow = element?.querySelector('.cain-divine-agony-row');
    const checkbox = element?.querySelector('.cain-use-divine-agony');

    if (!valueDisplay || !divineAgonyRow) return;

    if (!actor?.system?.divineAgony) {
      // No actor or no divine agony stat - show as disabled
      divineAgonyRow.classList.add('disabled');
      valueDisplay.textContent = '-';
      valueDisplay.title = 'Select a character to use Divine Agony';
      if (checkbox) checkbox.disabled = true;
      return;
    }

    const current = actor.system.divineAgony.value || 0;
    const max = actor.system.divineAgony.max || 3;

    divineAgonyRow.classList.remove('disabled');
    valueDisplay.textContent = `${current}/${max}`;
    valueDisplay.title = `Divine Agony: ${current} / ${max}`;
    if (checkbox) checkbox.disabled = current === 0;

    // Add visual indicator if divine agony is available
    if (current > 0) {
      divineAgonyRow.classList.add('has-agony');
    } else {
      divineAgonyRow.classList.remove('has-agony');
    }
  }
}
