import CainItemBase from "../base-item.mjs";

export default class CainDomain extends CainItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.domainName = new fields.StringField({ required: true, nullable: false, initial: "New Domain" });
    schema.domainDescription = new fields.StringField({ required: true, nullable: false, initial: "Domain Description" });

    return schema;
  }
}