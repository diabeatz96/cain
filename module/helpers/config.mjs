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
  {
    name: 'Eyes',
    abilities: [
      'You can see clearly up to extreme distance, as if you could ‘zoom in’ your vision',
      'You can see through walls and nonliving matter in short distance',
      'When closed, you can sense the ambient emotional state of nearby humans or exorcists. Once a mission, gain +1D or power when acting on this.',
      'Once a mission, you can momentarily paralyze a human by merely looking at them. The effect lasts until you break eye contact, a minute passes, or either of you suffer stress.',
      'You can see clearly in the dark and are unaffected by darkness, weather, or obscurement.',
      'Gain +1D to Surveillance. This could put you up to 4D.'
    ]
  },
  {
    name: 'Jaw',
    abilities: [
      'You can spit black venom up to short distance. It’s a mundane ranged weapon with about the same effectiveness as a pistol.',
      'You can gain 1d3 sin to re-roll any roll requiring speech, taking the second result as final.',
      'You can whisper short messages into the wind of 6 words or less that a target of your choice can hear in their ear within long distance. The target cannot reply.',
      'You gain +1D when negotiating with, commanding, or convincing humans',
      'Once a mission, you can give a short, one word command to a human, who then immediately attempts to follow it to the best of their ability. Humans will not obey obviously harmful commands.',
      'Gain +1D to Authority. This could put you up to 4D.'
    ]
  },
  {
    name: 'Back or Chest',
    abilities: [
      'You can roll an extra resting die while resting. If you do, gain the same amount of sin.',
      'You no longer need to breathe. You are no longer affected by mundane toxin or poison. You cannot become intoxicated by alcohol.',
      'Gain +1 max KP.',
      'You have a chance of ignoring any injury (roll a d6, ignore on a 6)',
      'Automatically erase 1 stress when pressure increases.',
      'Gain +1D to Conditioning. This could put you up to 4D.'
    ]
  },
  {
    name: 'Arms or Hands',
    abilities: [
      'You can gain 1d3 sin to leap up to an object CAT size in height without rolling. You can do this as part of an action roll.',
      'While touching them with your bare flesh, you can can climb or walk on walls as though they were flat surfaces',
      'You have +1D when running or sprinting on open ground, such as a road',
      'You can gain 1 sin during an action roll to glide a short distance through the air as part of the action. You have to start at height to gain this benefit.',
      'You can gain 1d3 sin to go completely invisible to mundane perception for the duration of an action roll.',
      'Gain +1D to Covert. This could put you up to 4D.'
    ]
  },
  {
    name: 'Skin, Hair, Or Legs',
    abilities: [
      'You can gain 1d3 sin when performing a feat of mundane physical strength to increase the CAT up that feat up to CAT 3.',
      'Once a mission, you may merge any single mundane weapon or item you could hold into your flesh, able to conceal or produce it at will.',
      'Once a mission, you can dissolve all non-living matter in a cube about the size of a room into a black sludge with a touch of your third (ring) finger.',
      'Once a mission, you can gain 1d3+1 sin to morph your arm or hand into a melee weapon for a scene. It is a supernatural melee weapon and has normal effectiveness against sins.',
      'You can re-roll any force or interfacing roll, taking the second result as final. If you do, gain 1d3 sin.',
      'Gain +1D to Force. This could put you up to 4D.'
    ]
  },
  {
    name: 'Arms or Hands',
    abilities: [
      'You can gain 1d3 sin when performing a feat of mundane physical strength to increase the CAT up that feat up to CAT 3.',
      'Once a mission, you may merge any single mundane weapon or item you could hold into your flesh, able to conceal or produce it at will.',
      'Once a mission, you can dissolve all non-living matter in a cube about the size of a room into a black sludge with a touch of your third (ring) finger.',
      'Once a mission, you can gain 1d3+1 sin to morph your arm or hand into a melee weapon for a scene. It is a supernatural melee weapon and has normal effectiveness against sins.',
      'You can re-roll any force or interfacing roll, taking the second result as final. If you do, gain 1d3 sin.',
      'Gain +1D to Force. This could put you up to 4D.'
    ]
  }
];

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

