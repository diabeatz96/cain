import CainDataModel from "./base-model.mjs";

export default class CainItemBase extends CainDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    schema.primaryColor = new fields.StringField({ required: false, nullable: false, initial: "#000000" });
    schema.accentColor = new fields.StringField({ required: false, nullable: false, initial: "#FFFFFF" });
    schema.secondaryColor = new fields.StringField({ required: false, nullable: false, initial: "#CCCCCC" });
    schema.textColor = new fields.StringField({ required: false, nullable: false, initial: "#000000" });

    return schema;
  }

}