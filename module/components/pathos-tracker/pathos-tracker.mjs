const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// Default position if no saved position exists
const DEFAULT_POSITION = { top: 60, left: 110 };

class PathosTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: 'div',
    id: 'pathos-tracker',
    classes: ['pathos-tracker'],
    window: {
      title: 'Divine Agony Tracker',
      positioned: true,
      minimizable: false,
      resizable: false,
    },
    position: {
      top: DEFAULT_POSITION.top,
      left: DEFAULT_POSITION.left,
    }
  }
  static PARTS = {
    div: {
      template: "systems/cain/module/components/pathos-tracker/pathos-tracker.hbs"
    }
  }

  // When first created, find all character actors and register as an app
  async _onFirstRender(context, options) {
    super._onFirstRender(context, options);
    for (const actor of game.actors) {
      if (actor.type === 'character') {
        actor.apps[this.id] = this;
      }
    }

    // Load saved position
    const savedPosition = game.settings.get('cain', 'pathosTrackerPosition');
    if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
      this.setPosition(savedPosition);
    }
  }

  // Save position when window is moved
  setPosition(position) {
    const result = super.setPosition(position);

    // Save position to settings (debounced to avoid too many writes)
    if (this._positionSaveTimeout) {
      clearTimeout(this._positionSaveTimeout);
    }
    this._positionSaveTimeout = setTimeout(() => {
      const currentPos = this.position;
      if (currentPos.top !== undefined && currentPos.left !== undefined) {
        game.settings.set('cain', 'pathosTrackerPosition', {
          top: currentPos.top,
          left: currentPos.left
        });
      }
    }, 100);

    return result;
  }

  async _preparePartContext(partId, context) {
    const characters = game.actors;
    context.actors = characters
      .filter((character) => character.type === 'character' && !character.system.hideFromTracker)
      .map((character) => {
        return {
          name: character.name,
          img: character.img,
          currPathos: character.system.divineAgony.value,
          maxPathos: character.system.divineAgony.max,
        }
    });
    return context;
  }
}

Handlebars.registerHelper('hasMaxPathos', function (value) {
  return value.currPathos === value.maxPathos;
});

export default PathosTracker;