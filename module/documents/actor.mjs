/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CainActor extends Actor {
  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    // Default image by actor type. Centralizing here (rather than in each
    // DataModel's _preCreate) batches all source updates into a single
    // updateSource call. Multiple updateSource calls during _preCreate
    // retrigger the data-prep cycle in v13+ and trip "ActiveEffect
    // application phase already completed" errors.
    let defaultImg = "icons/svg/mystery-man.svg";
    switch (data.type) {
      case "character": defaultImg = "systems/cain/assets/exorcist/generic_exo.png"; break;
      case "sin":       defaultImg = "systems/cain/assets/Sins/ogre.png"; break;
      case "opponent":  defaultImg = "systems/cain/assets/Opponents/drifter.png"; break;
    }

    const updates = {};
    if (!data.img || data.img === "icons/svg/mystery-man.svg") {
      updates.img = defaultImg;
    }
    updates.prototypeToken = {
      actorLink: true,
      texture: { src: data.img || defaultImg }
    };

    this.updateSource(updates);
  }

  async _onCreate(data, options, userid) {
    await super._onCreate(data, options, userid);

    console.log('created!')
    // Register any relevant apps. These will re-render whenever this actor updates
    if (this.type === 'character') {
      this.apps['pathos-tracker'] = ui.pathosTracker;
      ui.pathosTracker.render({ force: true });
    }
  }

  _onDelete(options, userId) {
    // If character, unlink pathos tracker so it doesn't get deleted
    if (this.type === 'character') {
      delete this.apps['pathos-tracker'];
    }
    super._onDelete(options, userId);

    // force a re-render of the pathos element
    ui.pathosTracker.render({ force: true });
  }

  /** @override */
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    // If the actor image is being updated, also update the prototype token image
    // if (changed.img && !changed.prototypeToken?.texture?.src) {
    //   this.updateSource({
    //     "prototypeToken.texture.src": changed.img
    //   });
    // }
  }

  async _onUpdate(changed, options, user) {
    super._onUpdate(changed, options, user);
  }

  /** @override */
  getRollData() {
    return { ...super.getRollData(), ...this.system.getRollData?.() ?? null };
  }

  /**
   * Convert the actor document to a plain object.
   * 
   * The built in `toObject()` method will ignore derived data when using Data Models.
   * This additional method will instead use the spread operator to return a simplified
   * version of the data.
   * 
   * @returns {object} Plain object either via deepClone or the spread operator.
   */
  toPlainObject() {
    const result = {...this};

    // Simplify system data.
    result.system = this.system.toPlainObject?.() ?? {...this.system};

    // Add items.
    result.items = this.items?.size > 0 ? this.items.contents : [];

    // Add effects.
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];

    return result;
  }

}
