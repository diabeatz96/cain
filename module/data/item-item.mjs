import CainItemBase from "./base-item.mjs";

export default class CainItem extends CainItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d6" }),
      diceBonus: new fields.StringField({ initial: "" })
    })

    schema.formula = new fields.StringField({ blank: true });
    schema.kitPoint = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.scripValue = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });
    schema.type = new fields.StringField({ required: true, nullable: false, initial: "Aesthetics" });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const roll = this.roll;

    this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
}