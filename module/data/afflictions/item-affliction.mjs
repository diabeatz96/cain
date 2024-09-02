import CainItemBase from "../base-item.mjs";

export default class CainAffliction extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.afflictionName = new fields.StringField({ required: true, nullable: false, initial: "New Affliction" });
        schema.afflictionDescription = new fields.StringField({required: true, nullable: false, initial: "Affliction Description"});

    
        schema.formula = new fields.StringField({ blank: true });
    
        return schema;
    }
}
