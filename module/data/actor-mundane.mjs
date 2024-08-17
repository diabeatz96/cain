import CainActorBase from "./base-actor.mjs";

export default class CainMundane extends CainActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

   
    schema.executionTalisman = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.category = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, max: 7 });
    schema.complication = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.threats = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.description = new fields.StringField({ required: true, nullable: false, initial: "" });

    schema.rollData = new fields.SchemaField({
      roll1: new fields.StringField({ initial: "" }),
      roll2: new fields.StringField({ initial: "" }),
      roll3: new fields.StringField({ initial: "" }),
      roll4: new fields.StringField({ initial: "" }),
      roll5: new fields.StringField({ initial: "" }),
      roll6: new fields.StringField({ initial: "" }),
    });

    return schema
  }

  prepareDerivedData() {

  }
}