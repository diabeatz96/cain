import CainItemBase from "./base-item.mjs";

export default class CainBlasphemy extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.classType = new fields.StringField({ required: true, nullable: false, initial: "default" });
        schema.isPassive = new fields.BooleanField({ required: true, nullable: false, initial: false });
        schema.keywords = new fields.StringField({ required: true, nullable: false, initial: "" });
        

        return schema;
      }
    
      prepareDerivedData() {
        }
}