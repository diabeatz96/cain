// player-overview.js
export class PlayerOverview extends Application {
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        id: "player-overview",
        template: "systems/cain/templates/player-overview.hbs",
        width: 600,
        height: 600,
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
          message: actor ? null : "No actor assigned. Please assign an actor for player overview."
        };
      });
      console.log(playerData);
      return { playerData };
    }
  
    activateListeners(html) {
      super.activateListeners(html);
      // Add any event listeners if needed
    }
  }