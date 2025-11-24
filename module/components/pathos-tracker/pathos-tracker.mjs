import { PlayerOverview } from "../../documents/player-overview.mjs";
import { CainActor } from "../../documents/actor.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;


class PathosTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: 'div',
    window: {
      title: 'Pathos Tracker',
    }
  }
  static PARTS = {
    div: {
      template: "systems/cain/module/components/pathos-tracker/pathos-tracker.hbs"
    }
  }

  async _preparePartContext(partId, context) {
    const characters = game.actors;
    context.actors = characters
      .filter((character) => character.type === 'character')
      .map((character) => {
        return {
          name: character.name,
          img: character.img,
          currAgony: character.system.divineAgony.value,
          maxAgony: character.system.divineAgony.max,
        }
    });
    Hooks.on("updateActor", (actor, newValue) => {
      // Only rerender on an exorcist updating their agony
      if (newValue?.system?.divineAgony.value) {
        const matchingActor = context.actors.find((contextActor) => contextActor.name === actor.name);
        if (matchingActor.currAgony !== newValue?.system?.divineAgony.value) {
          this.render();
        }
      }
    });
    return context;
  }
}

export default PathosTracker;