import CainItemBase from "./base-item.mjs";

export default class CainAgenda extends CainItemBase {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.agendaName = new fields.StringField({ required: true, nullable: false, initial: "New Agenda" });
        schema.agendaItemChecklist = new fields.StringField({ required: true, nullable: false, initial: "New Agenda" });
        schema.abilityChecklist = new fields.StringField({ required: true, nullable: false, initial: "New Agenda" });
    
        schema.formula = new fields.StringField({ blank: true });
    
        return schema;
    }

}