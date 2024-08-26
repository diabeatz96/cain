export class SessionEndAdvancement extends FormApplication  {
    constructor(actor) {
        super();
        this.actor = actor;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            template: `systems/cain/templates/session-end-advancement.hbs`,
            id: 'session-end-advancement',
            title: 'End of Session Advancement',
        });
    }
    getData() {
        return {
          actor: this.actor,
        };
    }
    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
        var survival = 0;
        var firstAgenda = 0;
        var boldAgenda = 0;
        var injuries = 0;
        for(const [key, value] of Object.entries(formData)){
            console.log(key + " : " + value);
            if (key == "survival" && value) survival = 1;
            if (key.substring(0,11) == "firstAgenda" && value) firstAgenda++;
            if (key.substring(0,10) == "boldAgenda" && value) boldAgenda++;
            if (key == "injuries" && value) injuries = 1;
        }
        if (firstAgenda > 1) firstAgenda = 1;
        if (boldAgenda > 2) boldAgenda = 2;
        const totalGain = survival + firstAgenda + boldAgenda + injuries;
        const oldXPValue = this.actor.system.xp.value;
        const newXPValue = oldXPValue + totalGain;
        if (newXPValue >= this.actor.system.xp.max) {
          this.actor.update({ 'system.xp.value': newXPValue % this.actor.system.xp.max});
          const newAdvanceValue = this.actor.system.advancements.value + Math.floor(newXPValue/this.actor.system.xp.max);
          this.actor.update({ 'system.advancements.value': newAdvanceValue});
        } else {
          this.actor.update({ 'system.xp.value': newXPValue});
          console.log("Updated xp from " + oldXPValue + " to " + newXPValue );  
        }
    
    }   
}