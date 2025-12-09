import CainItemBase from "../base-item.mjs";

export default class CainBond extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        // Name of the virtue this bond represents
        schema.virtueName = new fields.StringField({ required: true, nullable: false, initial: "New Virtue" });

        // Array of stricture strings that must be followed while bonding
        schema.strictures = new fields.ArrayField(new fields.StringField(), { required: true, nullable: false, initial: [] });

        // Array of bondAbility item IDs (similar to blasphemy powers array)
        // These represent the level 0-3 abilities gained from this bond
        schema.abilities = new fields.ArrayField(new fields.StringField(), { required: true, nullable: false, initial: [] });

        // Reference to a high blasphemy item ID (gained at certain bond levels)
        // High blasphemies are "free" - don't increase XP cap or reduce sin overflow cap
        schema.highBlasphemy = new fields.StringField({ required: false, nullable: true, initial: "" });

        // The bond level at which the high blasphemy is gained (typically 1)
        schema.highBlasphemyLevel = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0, max: 3 });

        return schema;
    }
}