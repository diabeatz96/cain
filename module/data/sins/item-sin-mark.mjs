import CainItemBase from "../base-item.mjs";

export default class CainSinMark extends CainItemBase {

    static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.bodyPartName = new fields.StringField({ required: true, nullable: false, initial: "Body Part Name" });
    schema.markAmount = new fields.IntegerField({ required: true, nullable: false, initial: 0, min: 0, max: 10 });
    
    /*
    description is inherited by CainItemBase
    schema.description = new fields.StringField({ required: true, nullable: false, initial: "default" });
    */
   
    return schema;
    }

}