/**
 * CainDiceRoller - Core dice rolling utility for the CAIN system
 * Handles skill rolls, psyche rolls, and special roll types
 * Compatible with Foundry VTT v11, v12, and v13
 */
export class CainDiceRoller {
  /**
   * Roll types available in CAIN
   */
  static ROLL_TYPES = {
    SKILL: 'skill',
    PSYCHE: 'psyche',
    RISK: 'risk',
    FATE: 'fate',
    REST: 'rest',
    CUSTOM: 'custom'
  };

  /**
   * Available skills in CAIN
   */
  static SKILLS = ['force', 'conditioning', 'coordination', 'covert', 'interfacing', 'investigation', 'surveillance', 'negotiation', 'authority', 'connection'];

  /**
   * Perform a skill roll
   * @param {Object} options - Roll options
   * @param {string} options.skill - The skill to roll (violence, sensitivity, machination, clarity)
   * @param {number} options.pool - Base dice pool (skill value)
   * @param {number} [options.extraDice=0] - Additional dice to add
   * @param {boolean} [options.hard=false] - Whether this is a hard roll (only 6s count)
   * @param {boolean} [options.teamwork=false] - Whether teamwork bonus applies (+1 die)
   * @param {boolean} [options.setup=false] - Whether setup bonus applies (+1 die)
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll to GM
   * @param {number|null} [options.usedDivineAgony=null] - Amount of divine agony used (if any)
   * @returns {Promise<Object>} Roll result with successes and roll object
   */
  static async rollSkill(options = {}) {
    const {
      skill = 'violence',
      pool = 1,
      extraDice = 0,
      hard = false,
      teamwork = false,
      setup = false,
      actor = null,
      whisper = false,
      usedDivineAgony = null
    } = options;

    const totalDice = Math.max(pool + extraDice + (teamwork ? 1 : 0) + (setup ? 1 : 0), 0);

    return this._executeRoll({
      type: this.ROLL_TYPES.SKILL,
      label: skill.charAt(0).toUpperCase() + skill.slice(1),
      totalDice,
      hard,
      actor,
      whisper,
      modifiers: { teamwork, setup, extraDice, usedDivineAgony }
    });
  }

  /**
   * Perform a psyche roll
   * @param {Object} options - Roll options
   * @param {number} options.psyche - Base psyche value
   * @param {number} [options.extraDice=0] - Additional dice to add
   * @param {boolean} [options.hard=false] - Whether this is a hard roll
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll
   * @param {number|null} [options.usedDivineAgony=null] - Amount of divine agony used (if any)
   * @returns {Promise<Object>} Roll result
   */
  static async rollPsyche(options = {}) {
    const {
      psyche = 1,
      extraDice = 0,
      hard = false,
      actor = null,
      whisper = false,
      usedDivineAgony = null
    } = options;

    const totalDice = Math.max(psyche + extraDice, 0);

    return this._executeRoll({
      type: this.ROLL_TYPES.PSYCHE,
      label: 'Psyche',
      totalDice,
      hard,
      actor,
      whisper,
      modifiers: { extraDice, usedDivineAgony }
    });
  }

  /**
   * Perform a risk roll (1d6 with outcome interpretation)
   * @param {Object} options - Roll options
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll
   * @returns {Promise<Object>} Roll result with outcome
   */
  static async rollRisk(options = {}) {
    const { actor = null, whisper = false } = options;

    const roll = new Roll('1d6');
    await roll.evaluate();

    const outcome = this._getRiskOutcome(roll.total);

    const messageContent = this._buildRiskMessage(roll.total, outcome);

    await this._sendToChat({
      roll,
      content: messageContent,
      flavor: 'Risk Roll',
      actor,
      whisper
    });

    return {
      roll,
      total: roll.total,
      outcome: outcome.text,
      color: outcome.color
    };
  }

  /**
   * Perform a fate roll (1d6 with outcome interpretation)
   * @param {Object} options - Roll options
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll
   * @returns {Promise<Object>} Roll result with outcome
   */
  static async rollFate(options = {}) {
    const { actor = null, whisper = false } = options;

    const roll = new Roll('1d6');
    await roll.evaluate();

    const outcome = this._getFateOutcome(roll.total);

    const messageContent = this._buildFateMessage(roll.total, outcome);

    await this._sendToChat({
      roll,
      content: messageContent,
      flavor: 'Fate Roll',
      actor,
      whisper
    });

    return {
      roll,
      total: roll.total,
      outcome: outcome.text,
      color: outcome.color
    };
  }

  /**
   * Perform a rest dice roll (2d3 + modifiers)
   * @param {Object} options - Roll options
   * @param {number} [options.modifier=0] - Rest dice modifier
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll
   * @returns {Promise<Object>} Roll result with individual dice
   */
  static async rollRest(options = {}) {
    const { modifier = 0, actor = null, whisper = false } = options;

    const totalDice = 2 + modifier;
    const roll = new Roll(`${totalDice}d3`);
    await roll.evaluate();

    const diceResults = roll.terms[0].results.map(r => r.result);

    const messageContent = this._buildRestMessage(diceResults);

    await this._sendToChat({
      roll,
      content: messageContent,
      flavor: 'Rest Dice',
      actor,
      whisper
    });

    return {
      roll,
      total: roll.total,
      dice: diceResults
    };
  }

  /**
   * Perform a custom dice roll
   * @param {Object} options - Roll options
   * @param {string} options.formula - The dice formula to roll
   * @param {string} [options.label='Custom Roll'] - Label for the roll
   * @param {Actor} [options.actor=null] - The actor making the roll
   * @param {boolean} [options.whisper=false] - Whether to whisper the roll
   * @returns {Promise<Object>} Roll result
   */
  static async rollCustom(options = {}) {
    const { formula, label = 'Custom Roll', actor = null, whisper = false } = options;

    if (!formula) {
      ui.notifications.error('No dice formula provided');
      return null;
    }

    const roll = new Roll(formula);
    await roll.evaluate();

    await this._sendToChat({
      roll,
      flavor: label,
      actor,
      whisper
    });

    return {
      roll,
      total: roll.total,
      formula
    };
  }

  /**
   * Execute a skill/psyche type roll with success counting
   * @private
   */
  static async _executeRoll({ type, label, totalDice, hard, actor, whisper, modifiers = {} }) {
    let roll;
    let isZeroDice = false;
    let successes;
    let diceResults;

    if (totalDice > 0) {
      // Normal roll: count successes on 4+ (or 6 if hard)
      roll = new Roll(`${totalDice}d6cs>=${hard ? 6 : 4}`);
      await roll.evaluate();
      successes = roll.total;
      diceResults = roll.dice[0].results.map(r => ({
        result: r.result,
        success: hard ? r.result >= 6 : r.result >= 4,
        discarded: r.discarded || false
      }));
    } else {
      // Zero dice: roll 2d6, keep lowest, then check if that die is a success
      roll = new Roll('2d6kl');
      await roll.evaluate();
      isZeroDice = true;

      // Get the kept (lowest) die value
      const lowestValue = roll.total;
      const threshold = hard ? 6 : 4;
      successes = lowestValue >= threshold ? 1 : 0;

      // Mark which dice were kept/discarded for display
      diceResults = roll.dice[0].results.map(r => ({
        result: r.result,
        success: !r.discarded && r.result >= threshold,
        discarded: r.discarded || false
      }));
    }

    const messageContent = this._buildSuccessMessage({
      label,
      successes,
      diceResults,
      hard,
      isZeroDice,
      modifiers
    });

    await this._sendToChat({
      roll,
      content: messageContent,
      actor,
      whisper
    });

    return {
      roll,
      successes,
      diceResults,
      isZeroDice,
      hard,
      type
    };
  }

  /**
   * Build HTML content for success-counting rolls
   * @private
   */
  static _buildSuccessMessage({ label, successes, diceResults, hard, isZeroDice, modifiers }) {
    const successColor = successes > 0 ? '#4ade80' : '#f87171';
    const threshold = hard ? '6' : '4+';

    let modifierText = '';
    if (modifiers.teamwork) modifierText += ' <span class="cain-dice-modifier">+Teamwork</span>';
    if (modifiers.setup) modifierText += ' <span class="cain-dice-modifier">+Setup</span>';
    if (modifiers.extraDice && !modifiers.usedDivineAgony) {
      modifierText += ` <span class="cain-dice-modifier">+${modifiers.extraDice} Extra</span>`;
    }
    if (modifiers.usedDivineAgony) {
      modifierText += ` <span class="cain-dice-modifier cain-divine-agony-modifier"><i class="fas fa-fire-alt"></i> +${modifiers.usedDivineAgony} Divine Agony</span>`;
    }

    let diceDisplay = diceResults.map(d => {
      let classes = 'cain-die';
      if (d.success) classes += ' success';
      if (d.discarded) classes += ' discarded';
      if (d.result === 6) classes += ' crit';
      return `<span class="${classes}">${d.result}</span>`;
    }).join(' ');

    // Show divine agony gained on failure
    const failedRoll = successes === 0;
    const divineAgonyGainedText = failedRoll ? '<div class="cain-divine-agony-gained"><i class="fas fa-fire-alt"></i> +1 Divine Agony</div>' : '';

    return `
      <div class="cain-roll-result${modifiers.usedDivineAgony ? ' used-divine-agony' : ''}">
        <div class="cain-roll-header">
          <span class="cain-roll-label">${label} Roll</span>
          ${hard ? '<span class="cain-roll-hard">HARD</span>' : ''}
          ${isZeroDice ? '<span class="cain-roll-zero">ZERO DICE</span>' : ''}
        </div>
        ${modifierText ? `<div class="cain-roll-modifiers">${modifierText}</div>` : ''}
        <div class="cain-roll-dice">${diceDisplay}</div>
        <div class="cain-roll-successes">
          <span class="cain-success-label">Successes (${threshold}):</span>
          <span class="cain-success-value" style="color: ${successColor}">${successes}</span>
        </div>
        ${divineAgonyGainedText}
      </div>
    `;
  }

  /**
   * Build HTML content for risk rolls
   * @private
   */
  static _buildRiskMessage(total, outcome) {
    return `
      <div class="cain-roll-result cain-risk-roll">
        <div class="cain-roll-header">
          <span class="cain-roll-label">Risk Roll</span>
        </div>
        <div class="cain-roll-outcome" style="color: ${outcome.color}">
          <span class="cain-outcome-value">${total}</span>
          <span class="cain-outcome-text">${outcome.text}</span>
        </div>
      </div>
    `;
  }

  /**
   * Build HTML content for fate rolls
   * @private
   */
  static _buildFateMessage(total, outcome) {
    return `
      <div class="cain-roll-result cain-fate-roll">
        <div class="cain-roll-header">
          <span class="cain-roll-label">Fate Roll</span>
        </div>
        <div class="cain-roll-outcome" style="color: ${outcome.color}">
          <span class="cain-outcome-value">${total}</span>
          <span class="cain-outcome-text">${outcome.text}</span>
        </div>
      </div>
    `;
  }

  /**
   * Build HTML content for rest rolls
   * @private
   */
  static _buildRestMessage(diceResults) {
    const diceDisplay = diceResults.map(d =>
      `<span class="cain-die rest-die">${d}</span>`
    ).join(' ');

    return `
      <div class="cain-roll-result cain-rest-roll">
        <div class="cain-roll-header">
          <span class="cain-roll-label">Rest Dice</span>
        </div>
        <div class="cain-roll-dice">${diceDisplay}</div>
        <div class="cain-rest-info">
          <p>Assign each die to one of:</p>
          <ul>
            <li>Regain that many psyche bursts</li>
            <li>Recover stress equal to the die</li>
            <li>Erase slashes on a hook equal to the die</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Get risk roll outcome based on result
   * @private
   */
  static _getRiskOutcome(total) {
    switch (total) {
      case 1: return { text: 'Much Worse', color: '#ef4444' };
      case 2:
      case 3: return { text: 'Worse', color: '#f97316' };
      case 4:
      case 5: return { text: 'Expected', color: '#eab308' };
      case 6: return { text: 'Better', color: '#22c55e' };
      default: return { text: 'Unknown', color: '#9ca3af' };
    }
  }

  /**
   * Get fate roll outcome based on result
   * @private
   */
  static _getFateOutcome(total) {
    switch (total) {
      case 1: return { text: 'Poorest Result', color: '#ef4444' };
      case 2:
      case 3: return { text: 'Poor Result', color: '#f97316' };
      case 4:
      case 5: return { text: 'Good Result', color: '#eab308' };
      case 6: return { text: 'Best Result', color: '#22c55e' };
      default: return { text: 'Unknown', color: '#9ca3af' };
    }
  }

  /**
   * Send roll result to chat
   * @private
   */
  static async _sendToChat({ roll, content, flavor, actor, whisper }) {
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: content || flavor
    };

    if (whisper) {
      messageData.whisper = game.users.filter(u => u.isGM).map(u => u.id);
    }

    await roll.toMessage(messageData);
  }
}
