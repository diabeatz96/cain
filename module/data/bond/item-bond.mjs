import CainItemBase from "../base-item.mjs";

export default class CainBond extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.virtueName = new fields.StringField({ required: true, nullable: false, initial: "New Bond" });
        schema.bondStrictures = new fields.ArrayField(new fields.StringField(), { required: true, nullable: false, initial: [] });

        return schema;
    }
}