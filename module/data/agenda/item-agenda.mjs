import CainItemBase from "../base-item.mjs";
import CainAgendaTask from "./item-agenda-task.mjs";

export default class CainAgenda extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.agendaName = new fields.StringField({ required: true, nullable: false, initial: "New Agenda" });

    
        schema.formula = new fields.StringField({ blank: true });

        schema.unboldedTasks = new fields.ArrayField(new fields.StringField())
        schema.boldedTasks = new fields.ArrayField(new fields.StringField())

        schema.abilities = new fields.ArrayField(new fields.StringField());
        return schema;
    }
}

