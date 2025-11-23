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
}

export default PathosTracker;