export const CAIN = {};



/**
 * Registered Skills within the system.
 * @type {Object}
 * /

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
CAIN.abilities = {
  str: 'CAIN.Ability.Str.long',
  dex: 'CAIN.Ability.Dex.long',
  con: 'CAIN.Ability.Con.long',
  int: 'CAIN.Ability.Int.long',
  wis: 'CAIN.Ability.Wis.long',
  cha: 'CAIN.Ability.Cha.long',
};


/** sin marks */

CAIN.sinMarks = [
  { name: 'Mark 1', abilities: ['Ability 1.1', 'Ability 1.2', 'Ability 1.3', 'Ability 1.4', 'Ability 1.5', 'Ability 1.6'] },
  { name: 'Mark 2', abilities: ['Ability 2.1', 'Ability 2.2', 'Ability 2.3', 'Ability 2.4', 'Ability 2.5', 'Ability 2.6'] },
  { name: 'Mark 3', abilities: ['Ability 3.1', 'Ability 3.2', 'Ability 3.3', 'Ability 3.4', 'Ability 3.5', 'Ability 3.6'] },
  { name: 'Mark 4', abilities: ['Ability 4.1', 'Ability 4.2', 'Ability 4.3', 'Ability 4.4', 'Ability 4.5', 'Ability 4.6'] },
  { name: 'Mark 5', abilities: ['Ability 5.1', 'Ability 5.2', 'Ability 5.3', 'Ability 5.4', 'Ability 5.5', 'Ability 5.6'] },
  { name: 'Mark 6', abilities: ['Ability 6.1', 'Ability 6.2', 'Ability 6.3', 'Ability 6.4', 'Ability 6.5', 'Ability 6.6'] }
]


/**
 *       "Force": { "long": "Force", "abbr": "force" },
      "Conditioning": { "long": "Conditioning", "abbr": "conditioning" },
      "Coordination": { "long": "Coordination", "abbr": "coordination" },
      "Covert": { "long": "Covert", "abbr": "covert" },
      "Interfacing": { "long": "Interfacing", "abbr": "interfacing" },
      "Investigation": { "long": "Investigation", "abbr": "investigation" },
      "Surveillance": { "long": "Surveillance", "abbr": "surveillance" },
      "Negotiation": { "long": "Negotiation", "abbr": "negotiation" },
      "Authority": { "long": "Authority", "abbr": "authority" },
      "Connection": { "long": "Connection", "abbr": "connection" }

  */

CAIN.skills = {
  force: 'CAIN.Skill.Force.long',
  conditioning: 'CAIN.Skill.Conditioning.long',
  coordination: 'CAIN.Skill.Coordination.long',
  covert: 'CAIN.Skill.Covert.long',
  interfacing: 'CAIN.Skill.Interfacing.long',
  investigation: 'CAIN.Skill.Investigation.long',
  surveillance: 'CAIN.Skill.Surveillance.long',
  negotiation: 'CAIN.Skill.Negotiation.long',
  authority: 'CAIN.Skill.Authority.long',
  connection: 'CAIN.Skill.Connection.long',
};



CAIN.abilityAbbreviations = {
  str: 'CAIN.Ability.Str.abbr',
  dex: 'CAIN.Ability.Dex.abbr',
  con: 'CAIN.Ability.Con.abbr',
  int: 'CAIN.Ability.Int.abbr',
  wis: 'CAIN.Ability.Wis.abbr',
  cha: 'CAIN.Ability.Cha.abbr',
};
