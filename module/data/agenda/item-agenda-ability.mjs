import CainItemBase from "../base-item.mjs";

export default class CainAgenda extends CainItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
    
        
        schema.agendaName = new fields.StringField({ required: true, nullable: false, initial: "New Agenda" });

    
        schema.formula = new fields.StringField({ blank: true });

        schema.primaryTask = new fields.SchemaField({
            task: new fields.StringField({required: true, nullable: false, initial: "be chill"}),
            isBold: new fields.BooleanField({required: true, nullable: false, initial: true})
        }, {required: false, nullable: true, initial: {task: "be chill", isBold: false}});
        schema.boldedTasks = new fields.ArrayField(new fields.SchemaField({
            task: new fields.StringField({required: true, nullable: false, initial: "be chill"}),
            isBold: new fields.BooleanField({required: true, nullable: false, initial: true})
        }), {required: false, nullable: true, initial: [{task: "don't be unchill", isBold: true}]});

        schema.abilities = new fields.ArrayField(new fields.SchemaField({
            name: new fields.StringField({required: false, nullable: true, initial: "New Ability"}),
            description: new fields.StringField({required: false, nullable: true, initial: "Ability Description"})
        }),  {required: false, nullable: true, initial: [{name: "bonk", description: "hit em good"}]});
    
        return schema;
    }

}
