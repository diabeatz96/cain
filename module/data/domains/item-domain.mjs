import CainItemBase from "../base-item.mjs";

export default class CainDomain extends CainItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.sinSource = new fields.StringField({ required: true, nullable: false, initial: "ogre" })
    schema.domainName = new fields.StringField({ required: true, nullable: false, initial: "New Domain" });
    schema.domainDescription = new fields.StringField({required: true, nullable: false, initial: "Domain Description"});
    schema.selectsExorcist = new fields.BooleanField({required: true, nullable: false, initial: false});

    return schema;
  }
}