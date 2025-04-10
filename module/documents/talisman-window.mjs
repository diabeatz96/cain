import { CainActorSheet } from "../sheets/actor-sheet.mjs";

export class TalismanWindow extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'talisman-window',
      title: 'Talismans',
      template: 'systems/cain/templates/talisman-window.hbs',
      width: 1000, // Adjusted initial width
      height: 800, // Adjusted initial height
      resizable: true,
    });
  }

  getData() {
    return {
      talismans: game.settings.get('cain', 'globalTalismans'),
      isGM: game.user.isGM,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (game.user.isGM) {
      html.find('#add-talisman').on('click', this._onAddTalisman.bind(this));
      html.find('.talisman-name').on('change', this._onNameChange.bind(this));
      html.find('.delete-talisman').on('click', this._onDeleteTalisman.bind(this));
      html.find('.talisman-slider').on('input', this._onSliderChange.bind(this));
      html.find('.talisman-image').on('click', this._onImageClick.bind(this));
      html.find('.talisman-image').on('contextmenu', this._onDecreaseMarks.bind(this));
      html.find('.hide-talisman').on('click', this._onHideTalisman.bind(this));
      html.find('.talisman-max-mark').on('change', this._onMaxMarkChange.bind(this)); // Add listener for max mark amount

      // Add dragstart event listener
      html.find('.talisman').on('dragstart', this._onDragStart.bind(this));

      // Add pin event listener
      html.find('.pin-talisman').on('click', this._onPinTalisman.bind(this));

      // Add create tile event listener
      html.find('.create-tile').on('click', this._onCreateTile.bind(this));
    }
  }

  async _onDragStart(event) {
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];
    event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(talisman));
  }

  async _onNameChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].name = value;
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onAddTalisman(event) {
    event.preventDefault();
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans.push({
      name: 'New Talisman',
      imagePath: 'systems/cain/assets/Talismans/Talisman-A-0.png',
      currMarkAmount: 0,
      minMarkAmount: 0,
      maxMarkAmount: 26,
    });
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onDeleteTalisman(event) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans.splice(index, 1);
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onSliderChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].currMarkAmount = parseInt(value, 10);
    const imagePath = talismans[index].imagePath;
    talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${value}.png`);
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onImageClick(event) {
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
    if (talismans[index].currMarkAmount < talismans[index].maxMarkAmount) {
      talismans[index].currMarkAmount++;
      const imagePath = talismans[index].imagePath;
      const imageNumber = parseInt(imagePath.match(/-(\d+)\.png$/)[1], 10);
      if (imageNumber < talismans[index].maxMarkAmount) {
        talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${imageNumber + 1}.png`);
      }
      await game.settings.set('cain', 'globalTalismans', talismans);
      this._emitUpdate();
    }
  }

  async _onDecreaseMarks(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
  
    // Change image similar to how the image change function works but in reverse
    const imagePath = talismans[index].imagePath;
    const imageNumber = parseInt(imagePath.match(/-(\d+)\.png$/)[1], 10);
    if (imageNumber > 0 && talismans[index].currMarkAmount > 0) {
      talismans[index].currMarkAmount--;
      talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${imageNumber - 1}.png`);
    }
  
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onHideTalisman(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].isHidden = !talismans[index].isHidden;
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onMaxMarkChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = parseInt(event.currentTarget.value, 10);
    const talismans = game.settings.get('cain', 'globalTalismans');
    
    // Ensure value is between 0 and 13
    const newMaxMarkAmount = Math.max(0, Math.min(26, value));
    talismans[index].maxMarkAmount = newMaxMarkAmount;
    
    // Adjust currMarkAmount if it exceeds the new maxMarkAmount
    if (talismans[index].currMarkAmount > newMaxMarkAmount) {
      talismans[index].currMarkAmount = newMaxMarkAmount;
      const imagePath = talismans[index].imagePath;
      talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${newMaxMarkAmount}.png`);
    }
    
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onPinTalisman(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];
  
    // Create a pinned talisman container if it doesn't exist
    let pinnedContainer = document.querySelector('.pinned-talisman-container');
    if (!pinnedContainer) {
      pinnedContainer = document.createElement('div');
      pinnedContainer.classList.add('pinned-talisman-container');
      pinnedContainer.style.width = '169px'; // Adjusted initial width
      pinnedContainer.style.height = '291px'; // Adjusted initial height
      document.body.appendChild(pinnedContainer); // Append to body for full screen dragging
      console.log('Pinned talisman container created and appended to the body.');
  
      // Make the container draggable and resizable
      this._makeDraggable(pinnedContainer);
      this._makeResizable(pinnedContainer);
    }
  
    // Create a pinned talisman element
    const pinnedTalismanHtml = `
      <div class="pinned-talisman" data-index="${index}">
        <img src="${talisman.imagePath}" alt="${talisman.name}" title="${talisman.name}">
        <span>${talisman.name}</span>
        <span class="talisman-marks">${talisman.currMarkAmount} / ${talisman.maxMarkAmount}</span>
        <button class="unpin-talisman" data-index="${index}"><i class="fas fa-times"></i> Unpin</button>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = pinnedTalismanHtml;
    const pinnedTalismanElement = div.firstElementChild;
    pinnedContainer.appendChild(pinnedTalismanElement);
  
    console.log('innerHTML', div.innerHTML);
    console.log('pinned container', pinnedContainer);
    console.log(`Pinned talisman added: ${talisman.name}`);
    console.log('Final pinned container', pinnedContainer);
  
    // Add unpin functionality
    pinnedTalismanElement.querySelector('.unpin-talisman').addEventListener('click', this._onUnpinTalisman.bind(this));
  }

  async _onCreateTile(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];

    console.log('Creating tile for talisman:', talisman);

    // Calculate the center position of the current screen
    const centerX = canvas.stage.pivot.x + (canvas.stage.width / 2);
    const centerY = canvas.stage.pivot.y + (canvas.stage.height / 2);

    const tileData = {
      texture: {
        src: talisman.imagePath
      },
      width: 200, // Increased width
      height: 200, // Increased height
      x: centerX,
      y: centerY,
      flags: {
        talismanData: talisman
      }
    };

    console.log('Tile data:', tileData);

    try {
      const createdTiles = await canvas.scene.createEmbeddedDocuments('Tile', [tileData]);
      if (createdTiles.length > 0) {
        console.log('Tile created successfully:', createdTiles[0]);
        ui.notifications.info(`Created tile for ${talisman.name}`);
      } else {
        console.error('Tile creation failed:', createdTiles);
        ui.notifications.error('Failed to create tile.');
      }
    } catch (error) {
      console.error('Error creating tile:', error);
      ui.notifications.error('Error creating tile.');
    }
  }

  async _updateTile(talisman) {
    if (!talisman) return;
    if (canvas.scene === null) return;
    const tiles = canvas.scene.tiles.filter(tile => tile.flags.talismanData && tile.flags.talismanData.name === talisman.name) || [];
    console.log('Tiles to update:', tiles);
    if (tiles.length === 0) return;
    for (let tile of tiles) {
      await tile.update({ 'texture.src': talisman.imagePath });
      console.log(`Tile updated: ${tile.id} with new texture: ${talisman.imagePath}`);
    }
  }

  async _onUnpinTalisman(event) {
    event.preventDefault();
    const index = event.currentTarget.dataset.index;
    const pinnedTalisman = document.querySelector(`.pinned-talisman[data-index="${index}"]`);
    if (pinnedTalisman) {
      pinnedTalisman.remove();
      console.log(`Pinned talisman removed: ${index}`);
    }

    // Check if the container is empty and remove it if necessary
    const pinnedContainer = document.querySelector('.pinned-talisman-container');
    if (pinnedContainer && pinnedContainer.querySelectorAll('.pinned-talisman').length === 0) {
      pinnedContainer.remove();
      console.log('Pinned talisman container removed as it is empty.');
    }
  }

  _emitUpdate() {
    console.log('Emitting updateTalismans');
    game.socket.emit('system.cain', { action: 'updateTalismans' });
    this.render(true); // Update the UI for the emitting client
    this._updatePinnedTalismans(); // Update pinned talismans
    this._updateSinSelectedTalismans(); // Update sin selected talismans
    this._updateTiles(); // Update tiles
    for (let app of Object.values(ui.windows)) {
      if (app instanceof CainActorSheet) {
        app.render(true); // Force re-render
      }
    }
  }

  _updateSinSelectedTalismans() {
    const globalTalismans = game.settings.get('cain', 'globalTalismans');
    for (let actor of game.actors.contents) {
      if (actor.system.selectedTalismans) {
        const updatedTalismans = actor.system.selectedTalismans.map(talisman => {
          const globalTalisman = globalTalismans.find(gt => gt.name === talisman.name);
          if (globalTalisman) {
            return {
              ...globalTalisman,
              currMarkAmount: talisman.currMarkAmount,
              maxMarkAmount: globalTalisman.maxMarkAmount,
              name: globalTalisman.name,
              imagePath: globalTalisman.imagePath
            };
          } else {
            return talisman;
          }
        });
        actor.update({ 'system.selectedTalismans': updatedTalismans });
      }
    }
  }

  _updatePinnedTalismans() {
    const talismans = game.settings.get('cain', 'globalTalismans');
    const pinnedTalismans = document.querySelectorAll('.pinned-talisman');
    pinnedTalismans.forEach(pinnedTalisman => {
      const index = pinnedTalisman.dataset.index;
      const talisman = talismans[index];
      if (talisman) {
        pinnedTalisman.querySelector('img').src = talisman.imagePath;
        pinnedTalisman.querySelector('span').textContent = talisman.name;
        pinnedTalisman.querySelector('.talisman-marks').textContent = `${talisman.currMarkAmount} / ${talisman.maxMarkAmount}`;
      }
    });
  }

  _updateTiles() {
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans.forEach(talisman => {
      this._updateTile(talisman);
    });
  }
}

// Register the socket listener to update the TalismanWindow for all clients
Hooks.once('ready', () => {
  game.socket.on('system.cain', (data) => {
    console.log('Received socket data', data);
    if (data.action === 'updateTalismans') {
      for (let app of Object.values(ui.windows)) {
        if (app instanceof TalismanWindow) {
          app.render(true); // Force re-render
        }
      }
      // Re-render the actor sheet to update talismans
      for (let app of Object.values(ui.windows)) {
        if (app instanceof CainActorSheet) {
          app.render(true); // Force re-render
        }
      }
    }
  });

  // Add drop event listener to the canvas
  canvas.stage.on('drop', async (event) => {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    await createTalismanOnCanvas(data);
  });

});

// Function to create a talisman on the canvas
async function createTalismanOnCanvas(talisman) {
  const tileData = {
    texture: {
      src: talisman.imagePath
    },
    width: 200, // Increased width
    height: 200, // Increased height
    x: canvas.stage.mouseX,
    y: canvas.stage.mouseY,
    flags: {
      talismanData: talisman
    }
  };
  await canvas.scene.createEmbeddedDocuments('Tile', [tileData]);
}