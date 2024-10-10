// player-overview.js
export class PlayerOverview extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "player-overview",
            template: "systems/cain/templates/player-overview.hbs",
            width: 800,
            height: 700,
            title: "Player Overview",
            resizable: true,
        });
    }

    getData() {
        // Fetch all players
        const players = game.users.filter(user => !user.isGM);
        const playerData = players.map(player => {
            const actor = player.character;
            return {
                name: player.name,
                actor: actor ? actor : null,
                agendaTasks: actor ? this._getItemsFromIDs(actor.system.currentUnboldedAgendaTasks.concat(actor.system.currentBoldedAgendaTasks)) : [],
                agendaAbilities: actor ? this._getItemsFromIDs(actor.system.currentAgendaAbilities) : [],
                blasphemies: actor ? this._getItemsFromIDs(actor.system.currentBlasphemies) : [],
                blasphemyPowers: actor ? this._getItemsFromIDs(actor.system.currentBlasphemyPowers) : [],
                sinMarks: actor ? this._getItemsFromIDs(actor.system.sinMarks) : [],
                sinMarkAbilities : actor ? this._getItemsFromIDs(actor.system.sinMarkAbilities) : [],
                afflictions: actor ? this._getItemsFromIDs(actor.system.afflictions) : [],
                message: actor ? null : "No actor assigned. Please assign an actor for player overview."
            };
        });
        console.log(playerData);
        return { playerData };
    }

    _getItemsFromIDs(ids) {
        return ids.map(id => game.items.get(id));
    } 

    activateListeners(html) {
        super.activateListeners(html);
        // Add any event listeners if needed
    }

    // Add a method to re-render the application
    static refresh() {
        const app = Object.values(ui.windows).find(w => w instanceof PlayerOverview);
        if (app) {
            console.log("Found PlayerOverview instance:", app);

            // Save current scroll position and active tab
            const scrollPosition = app.element.scrollTop();
            const activeTab = app.element.find('.tab.active').attr('data-tab');
            console.log("Saved scroll position:", scrollPosition);
            console.log("Saved active tab:", activeTab);

            // Re-render the application
            app.render(true);

            // Restore scroll position and active tab after rendering
            Hooks.once('renderPlayerOverview', () => {
                console.log("Restoring scroll position and active tab...");
                app.element.scrollTop(scrollPosition);
                app.element.find('.tab').removeClass('active');
                app.element.find('.item').removeClass('active');
                app.element.find(`.tab[data-tab="${activeTab}"]`).addClass('active');
                app.element.find(`.item[data-tab="${activeTab}"]`).addClass('active');
                console.log("Restored scroll position:", app.element.scrollTop());
                console.log("Restored active tab:", app.element.find('.tab.active').attr('data-tab'));
            });
        } else {
            console.log("PlayerOverview instance not found.");
        }
    }
}

// Hook to listen for actor updates and refresh the PlayerOverview
Hooks.on("updateActor", () => {
    console.log("updateActor hook triggered.");
    PlayerOverview.refresh();
});