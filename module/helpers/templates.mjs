/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Talismans
    'systems/cain/templates/talisman-window.hbs',
    // Actor partials.
    'systems/cain/templates/actor/parts/actor-features.hbs',
    'systems/cain/templates/actor/parts/actor-items.hbs',
    'systems/cain/templates/actor/parts/actor-abilities.hbs',
    'systems/cain/templates/actor/parts/actor-sin.hbs',
    'systems/cain/templates/actor/parts/actor-talismans.hbs',
    // Item partials
    'systems/cain/templates/item/parts/item-effects.hbs',
    
  ]);
};
