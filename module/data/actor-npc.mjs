import CainActorBase from "./base-actor.mjs";

export default class CainNPC extends CainActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.img = new fields.StringField({ required: true, nullable: false, initial: "systems/cain/assets/generic_sin.png" });
    schema.sinType = new fields.StringField({ required: true, nullable: false, initial: "ogre" });
    schema.sinForm = new fields.StringField({ required: true, nullable: false, initial: "Form I/Severed" });
    schema.category = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    schema.domains = new fields.SchemaField({
      ability1: new fields.SchemaField({
        title: new fields.StringField({ initial: "Hostile Door Patterns" }),
        value: new fields.StringField({ initial: "The world itself begins to turn against the exorcists. As a complication or a tension move, the ogre supernaturally erases entrances, exits, roads, vehicles, or light sources in an area of about a city block. These return when the scene passes or if the complication is dealt with. Once a hunt, as a tension move, if an exorcist opens any door, the entire group suddenly finds themself in an area of twisting corridors, pitch black darkness, and distant but troubling noises. The area is both dangerous and hostile to them. Finding an exit and escaping will require playing out a scene or two, and the Admin can set out talismans as needed." })
      }),
      ability2: new fields.SchemaField({
        title: new fields.StringField({ initial: "The Unseeing of Things" }),
        value: new fields.StringField({ initial: "The miasma becomes permeated with an deep, cloying dark. The ogre is invisible in darkness. It becomes hard to do anything to the ogre unless it is brightly lit or an action doesn’t rely on sight. As a tension move, all electric lights not held by an exorcist sputter out and cease functioning for the next scene. The Admin picks an exorcist and asks them ‘What do you see in the dark?’. They must answer truthfully and gain 1 stress after answering." })
      }),
      ability3: new fields.SchemaField({
        title: new fields.StringField({ initial: "The Grinding of Wheels" }),
        value: new fields.StringField({ initial: "The ogre can force exorcists to experience some of the crushing trauma that caused its birth. As a tension move, the ogre can pick an exorcist. That exorcist is afflicted by the Despair affliction. DESPAIR: This special affliction can only affect one exorcist at once. They gain the agenda item push people away even if losing this affliction. At the end of the mission, roll a 1d6. On a 1 or 2, keep this agenda item, on a 3+ may get rid of it. Ask that exorcist the question who in this group will let you down? Any time the chosen person fails an action roll, the afflicted exorcist gains 1 stress. However, if this triggered at least once during a session, at the end of that session also gain 1 xp." })
      }),
      ability4: new fields.SchemaField({
        title: new fields.StringField({ initial: "That Awful Flesh" }),
        value: new fields.StringField({ initial: "The ogre can regenerate rapidly from injuries. • It regenerates 1 segment of the execution talisman every time a risk result of 1 is rolled in a conflict scene where it is present. • The ogre takes -1 slash on its execution talisman unless damage by fire, acid, or some other strong chemical or solvent in the same scene." })
      }),
      ability5: new fields.SchemaField({
        title: new fields.StringField({ initial: "The Inevitable Place of Meat" }),
        value: new fields.StringField({ initial: "The ogre can temporarily cause the miasma to accelerate its effects. • The touch of the ogre can rapidly rot and decay objects, plant matter, and constructions, destroying them and dissolving them into mud and slime. • Exorcists inside the miasma start to superficially rot if they spend scenes there - hair falling out, sunken skin, dead skin cells, nails falling out, etc. They recover from this damage after the mission. • As a tension move the ogre can cause an exorcist inside the miasma to start decaying. They gain a hook with the Rotting affliction. • Exorcists subtract 1 from all their healing rolls." })
      }),
      ability6: new fields.SchemaField({
        title: new fields.StringField({ initial: "The Lash Calls you Brother" }),
        value: new fields.StringField({ initial: "At the start of a mission, the Ogre chooses an exorcist and creates a creature formed from the guilt and shame of that exorcist. The Admin secretly asks the targeted exorcist the following questions: • Which ally are you embarrassed to be around? • What's the worst thing you ever did? • What do you hate the most about yourself? The creature takes a form that plays off these answers. It is a trace with the following execution talisman." })
      }),
      ability7: new fields.SchemaField({
        title: new fields.StringField({ initial: "Where You Belong" }),
        value: new fields.StringField({ initial: "The ogre can control mud, water, and ambient temperature to killing effect. The ogre can sink into any sufficiently large pool of mud and reappear in short distance as part of any reaction it takes. As a tension move, the ogre can change the weather in its miasma zone until the exorcists rest, making it extremely hostile (freezing cold, rain, etc). It becomes hard or risky (or both) to perform any activity outside that requires concentration, focus, or manual dexterity without sufficient protection from the weather." })
      }),
      ability8: new fields.SchemaField({
        title: new fields.StringField({ initial: "The Agony" }),
        value: new fields.StringField({ initial: "Once a hunt, when pressure increases, the ogre can pick an exorcist. That exorcist gains the Sunken affliction for the rest of the mission." })
      })
    });
    
    schema.selectedAbilities = new fields.SchemaField({
      selectedAbility1: new fields.StringField({ initial: "Please choose an ability to get started" }),
      selectedAbility2: new fields.StringField({ initial: "Please choose an ability to get started" }),
      selectedAbility3: new fields.StringField({ initial: "Please choose an ability to get started" })
    });
    
    schema.palace = new fields.StringField({ initial: "default" });
    schema.appearance = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.biography = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.traumas = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.pressure = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.complications = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.threats = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.attackRoll = new fields.SchemaField({
      lowDamage: new fields.StringField({ initial: "1" }),
      mediumDamage: new fields.StringField({ initial: "2" }),
      highDamage: new fields.StringField({ initial: "3" }),
      rollFormula: new fields.StringField({ initial: "1d6" }),
    });

    schema.severeAttack = new fields.SchemaField({
      description: new fields.StringField({ initial: "" }),
      rollFormula: new fields.StringField({ initial: "5d6" }),
    });

    
    schema.afflictions = new fields.ArrayField(new fields.StringField({ required: true, initial: " " }), { required: true, initial: [] });
    schema.severeAbilityQuestions = new fields.ArrayField(new fields.StringField({ required: true, initial: " " }), { required: true, initial: [] });
    
    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    // Removed the call to updateFieldsBasedOnSinType
  }
}