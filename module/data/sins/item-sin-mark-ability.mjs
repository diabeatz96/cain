import CainItemBase from "../base-item.mjs";

export default class CainSinMarkAbility extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.abilityName = new fields.StringField({ required: true, nullable: false, initial: "New Ability" });
        schema.abilityDescription = new fields.StringField({required: true, nullable: false, initial: "Ability Description"});
        schema.bodyPartName = new fields.StringField({ required: true, nullable: false, initial: "Body Part Name" });
        
        /*
        item name and description are inherited by CainItemBase
        and Item from foundry.data.Item
        */
    
        schema.formula = new fields.StringField({ blank: true });
    
        return schema;
    }
}