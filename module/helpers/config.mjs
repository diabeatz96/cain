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
