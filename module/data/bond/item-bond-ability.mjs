import CainItemBase from "../base-item.mjs";

export default class CainBondAbility extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        // The bond level required to gain this ability (0-3)
        // Level 0: Gained immediately when bonding
        // Levels 1-3: Gained after surviving missions
        schema.bondLevel = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 3 });

        // Description of what this ability does
        schema.abilityDescription = new fields.StringField({ required: true, nullable: false, initial: "" });

        // Whether this ability is permanent (persists even when not actively bonding)
        schema.isPermanent = new fields.BooleanField({ required: true, nullable: false, initial: true });

        // Optional: If this is a high blasphemy ability, it may require spending psyche bursts
        schema.requiresPsycheBurst = new fields.BooleanField({ required: true, nullable: false, initial: false });

        // If requiresPsycheBurst is true, how many bursts are required (0 = all remaining, min 1)
        schema.psycheBurstCost = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 });

        return schema;
    }
}