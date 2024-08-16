import CainActorBase from "./base-actor.mjs";

export default class CainNPC extends CainActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.sinType = new fields.StringField({ required: true, nullable: false, initial: "ogre" });
    schema.sinForm = new fields.StringField({ required: true, nullable: false, initial: "Form I/Severed" });
    schema.category = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    schema.domains = new fields.SchemaField({
      ability1: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 1" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability2: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 2" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability3: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 3" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability4: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 4" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability5: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 5" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability6: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 6" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability7: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 7" }),
        value: new fields.StringField({ initial: "default" })
      }),
      ability8: new fields.SchemaField({
        title: new fields.StringField({ initial: "Ability 8" }),
        value: new fields.StringField({ initial: "default" })
      })
    });
    
    schema.selectedAbilities = new fields.SchemaField({
      selectedAbility1: new fields.StringField({ initial: "default" }),
      selectedAbility2: new fields.StringField({ initial: "default" }),
      selectedAbility3: new fields.StringField({ initial: "default" })
    });
    
    schema.palace = new fields.StringField({ initial: "default" });
    schema.appearance = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.biography = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.traumas = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.pressure = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.complications = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.threats = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.attackRoll = new fields.SchemaField({
      lowDamage: new fields.StringField({ initial: "" }),
      mediumDamage: new fields.StringField({ initial: "" }),
      highDamage: new fields.StringField({ initial: "" }),
      rollFormula: new fields.StringField({ initial: "1d6" }),
    });

    schema.severeAttack = new fields.SchemaField({
      description: new fields.StringField({ initial: "" }),
      rollFormula: new fields.StringField({ initial: "5d6" }),
    });

    
    schema.afflictions = new fields.ArrayField(new fields.StringField({ required: true, initial: " " }), { required: true, initial: [] });
  
    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    // Removed the call to updateFieldsBasedOnSinType
  }
}