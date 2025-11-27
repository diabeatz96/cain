const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;


class PathosTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: 'div',
    id: 'pathos-tracker',
    classes: ['pathos-tracker'],
    window: {
      title: 'Divine Agony Tracker',
      positioned: true,
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