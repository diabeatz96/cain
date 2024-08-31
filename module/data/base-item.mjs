import CainDataModel from "./base-model.mjs";

export default class CainItemBase extends CainDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    // Set default color scheme to a dark theme
    schema.primaryColor = new fields.StringField({ required: false, nullable: false, initial: "#2a2a2a" }); // Dark Gray
    schema.accentColor = new fields.StringField({ required: false, nullable: false, initial: "#ff00ff" }); // Magenta
    schema.secondaryColor = new fields.StringField({ required: false, nullable: false, initial: "#555555" }); // Medium Gray
    schema.textColor = new fields.StringField({ required: false, nullable: false, initial: "#ffffff" }); // White

    return schema;
  }

}