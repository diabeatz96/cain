import CainItemBase from "../base-item.mjs";

export default class CainBlasphemy extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        schema.blasphemyName = new fields.StringField({ required: true, nullable: false, initial: "default" });
        schema.powers = new fields.ArrayField(new fields.StringField(), { required: true, nullable: false, initial: [] });

        // New fields for colors
        schema.primaryColor = new fields.StringField({ required: true, nullable: false, initial: "#000000" });
        schema.accentColor = new fields.StringField({ required: true, nullable: false, initial: "#FFFFFF" });
        schema.secondaryColor = new fields.StringField({ required: true, nullable: false, initial: "#CCCCCC" });
        schema.textColor = new fields.StringField({ required: true, nullable: false, initial: "#000000" });

        return schema;
    }
}