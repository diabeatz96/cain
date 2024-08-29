import CainItemBase from "../base-item.mjs";

export default class CainBlasphemy extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.blasphemyName = new fields.StringField({ required: true, nullable: false, initial: "default" });
        schema.powers = new fields.ArrayField(new fields.StringField(), {required: true, nullable: false, initial: []});
        

        return schema;
      }
}