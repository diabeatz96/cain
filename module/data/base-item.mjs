import CainDataModel from "./base-model.mjs";

export default class CainItemBase extends CainDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    // Set default color scheme to purple
    schema.primaryColor = new fields.StringField({ required: false, nullable: false, initial: "#800080" }); // Purple
    schema.accentColor = new fields.StringField({ required: false, nullable: false, initial: "#D8BFD8" }); // Thistle
    schema.secondaryColor = new fields.StringField({ required: false, nullable: false, initial: "#9370DB" }); // Medium Purple
    schema.textColor = new fields.StringField({ required: false, nullable: false, initial: "#FFFFFF" }); // White

    return schema;
  }

}