import CainItemBase from "../base-item.mjs";

export default class CainBondAbility extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.bondAbilities = new fields.ObjectField({
                required: true,
                nullable: false,
                initial: {
                    "0": "Bond Ability 1",
                    "1": "Bond Ability 1",
                    "2": "Bond Ability 2",
                    "3": "Bond Ability 3",
                },
            });

        return schema;
    }
}