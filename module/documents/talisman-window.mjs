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

      // Add delete all tiles event listener
      html.find('.delete-all-tiles').on('click', this._onDeleteAllTiles.bind(this));
    }
  }

  async _onDragStart(event) {
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];
    event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(talisman));
  }

  async _onNameChange(event) {
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    console.log(`Changing talisman name at index ${index} (type: ${typeof index}) from "${talismans[index].name}" to "${value}"`);
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
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    console.log(`Changing talisman marks at index ${index} (type: ${typeof index}) to ${value}`);
    talismans[index].currMarkAmount = parseInt(value, 10);
    const imagePath = talismans[index].imagePath;
    talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${value}.png`);
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onImageClick(event) {
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].isHidden = !talismans[index].isHidden;
    await game.settings.set('cain', 'globalTalismans', talismans);
    this._emitUpdate();
  }

  async _onMaxMarkChange(event) {
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
    const index = parseInt(event.currentTarget.dataset.index, 10);
    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];

    console.log('Creating tile for talisman:', talisman);
    console.log('Index:', index, 'Type:', typeof index);

    // Get the center of the current viewport
    const viewPos = canvas.scene._viewPosition;
    const centerX = viewPos.x;
    const centerY = viewPos.y;

    console.log('Center position:', centerX, centerY);

    // Use proper talisman image size - 274x432 to match original dimensions
    const tileWidth = 274;
    const tileHeight = 432;

    const tileData = {
      texture: {
        src: talisman.imagePath,
        tint: null, // No tint to prevent washing out
        alphaThreshold: 0.0 // Show all pixels
      },
      width: tileWidth,
      height: tileHeight,
      x: centerX - (tileWidth / 2), // Center the tile on the position
      y: centerY - (tileHeight / 2),
      z: 100,
      alpha: 1.0,
      hidden: false,
      locked: false,
      overhead: false,
      roof: false,
      occlusion: {
        mode: 0, // No occlusion
        alpha: 0
      },
      video: {
        loop: true,
        autoplay: true,
        volume: 0
      },
      flags: {
        talismanData: {
          ...talisman,
          index: index
        },
        talismanName: talisman.name,
        talismanMarks: `${talisman.currMarkAmount}/${talisman.maxMarkAmount}`
      }
    };

    console.log('Tile data:', tileData);
    console.log('Talisman index being stored:', index);

    try {
      const createdTiles = await canvas.scene.createEmbeddedDocuments('Tile', [tileData]);
      if (createdTiles.length > 0) {
        const tile = createdTiles[0];
        console.log('Tile created successfully:', tile);
        console.log('Tile flags after creation:', tile.flags);
        console.log('Tile talismanData.index:', tile.flags?.talismanData?.index);

        // Store tile ID in talisman for better management
        talismans[index].tileIds = talismans[index].tileIds || [];
        if (!talismans[index].tileIds.includes(tile.id)) {
          talismans[index].tileIds.push(tile.id);
          await game.settings.set('cain', 'globalTalismans', talismans);
        }

        // Create a text label below the tile
        await this._createTileLabel(tile, talisman);

        ui.notifications.info(`Created tile for ${talisman.name} at center of screen`);
      } else {
        console.error('Tile creation failed:', createdTiles);
        ui.notifications.error('Failed to create tile.');
      }
    } catch (error) {
      console.error('Error creating tile:', error);
      ui.notifications.error('Error creating tile.');
    }
  }

  async _createTileLabel(tile, talisman) {
    // Create a drawing with text to label the tile - positioned below
    const labelWidth = 200;
    const labelHeight = 50;

    console.log('Creating label for tile:', tile.id);
    console.log('Tile position:', tile.x, tile.y, 'size:', tile.width, tile.height);

    const labelData = {
      x: tile.x + (tile.width / 2) - (labelWidth / 2), // Center horizontally
      y: tile.y + tile.height + 5, // Position below the tile with small gap
      shape: {
        type: 'r', // Rectangle
        width: labelWidth,
        height: labelHeight
      },
      fillColor: '#000000',
      fillAlpha: 0.8,
      strokeWidth: 2,
      strokeColor: '#00bfff',
      strokeAlpha: 1.0,
      text: `${talisman.name}\n${talisman.currMarkAmount} / ${talisman.maxMarkAmount}`,
      fontSize: 20,
      fontFamily: 'Signika',
      textColor: '#ffffff',
      textAlpha: 1.0,
      z: 100, // Same z-index as tile
      locked: false,
      hidden: false,
      flags: {
        cain: {
          talismanTileId: tile.id,
          talismanLabel: true,
          talismanIndex: talisman.index
        }
      }
    };

    console.log('Label data:', labelData);

    try {
      const createdDrawings = await canvas.scene.createEmbeddedDocuments('Drawing', [labelData]);
      if (createdDrawings && createdDrawings.length > 0) {
        console.log('Label created successfully! ID:', createdDrawings[0].id);
        console.log('Label flags:', createdDrawings[0].flags);
      } else {
        console.warn('Label creation returned empty array');
      }
    } catch (error) {
      console.error('Error creating label:', error);
      ui.notifications.warn('Could not create text label - drawings may not be supported');
    }
  }

  async _updateTile(talisman, index) {
    if (!talisman) return;
    if (canvas.scene === null) return;

    console.log(`\n=== Attempting to update tiles for index ${index} (${talisman.name}) ===`);
    console.log('Total tiles in scene:', canvas.scene.tiles.size);

    // Debug: Show all tiles and their flags
    canvas.scene.tiles.forEach(tile => {
      if (tile.flags?.talismanData) {
        console.log(`Tile ${tile.id}: index=${tile.flags.talismanData.index}, name=${tile.flags.talismanData.name}`);
      }
    });

    // Find tiles by talisman INDEX (not name, so renaming doesn't break the link)
    const tiles = canvas.scene.tiles.filter(tile =>
      tile.flags?.talismanData && tile.flags.talismanData.index === index
    ) || [];

    console.log(`Found ${tiles.length} tiles for index ${index}`);
    if (tiles.length === 0) {
      console.warn(`No tiles found for index ${index}!`);
      return;
    }

    for (let tile of tiles) {
      // Update texture and talisman data
      await tile.update({
        'texture.src': talisman.imagePath,
        'flags.talismanData': {
          ...talisman,
          index: index
        },
        'flags.talismanName': talisman.name,
        'flags.talismanMarks': `${talisman.currMarkAmount}/${talisman.maxMarkAmount}`
      });
      console.log(`Tile ${tile.id} updated: texture=${talisman.imagePath}, name=${talisman.name}, marks=${talisman.currMarkAmount}/${talisman.maxMarkAmount}`);

      // Update associated label if it exists
      const labels = canvas.scene.drawings.filter(d =>
        d.flags?.cain?.talismanTileId === tile.id && d.flags?.cain?.talismanLabel
      );

      console.log(`Found ${labels.length} labels for tile ${tile.id}`);

      for (let label of labels) {
        await label.update({
          text: `${talisman.name}\n${talisman.currMarkAmount} / ${talisman.maxMarkAmount}`
        });
        console.log(`Label updated: ${talisman.name} ${talisman.currMarkAmount}/${talisman.maxMarkAmount}`);
      }
    }
  }

  async _onDeleteAllTiles(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index, 10);
    console.log('Delete all tiles clicked for index:', index, 'Type:', typeof index);
    await this._deleteAllTilesForTalisman(index);
  }

  async _deleteAllTilesForTalisman(index) {
    if (canvas.scene === null) {
      ui.notifications.warn('No active scene');
      return;
    }

    const talismans = game.settings.get('cain', 'globalTalismans');
    const talisman = talismans[index];
    if (!talisman) return;

    console.log('Deleting all tiles for index:', index, 'name:', talisman.name);

    // Find all tiles for this talisman by INDEX (not name)
    const tiles = canvas.scene.tiles.filter(tile =>
      tile.flags?.talismanData && tile.flags.talismanData.index === index
    ) || [];

    console.log('Found tiles:', tiles.length);

    if (tiles.length === 0) {
      ui.notifications.warn(`No tiles found for ${talisman.name}`);
      return;
    }

    // Find all associated labels
    const tileIds = tiles.map(t => t.id);
    console.log('Tile IDs:', tileIds);

    const labels = canvas.scene.drawings.filter(d =>
      d.flags?.cain?.talismanLabel && tileIds.includes(d.flags?.cain?.talismanTileId)
    );

    console.log('Found labels:', labels.length);
    console.log('Label IDs:', labels.map(l => l.id));

    // Delete all tiles and labels
    try {
      await canvas.scene.deleteEmbeddedDocuments('Tile', tileIds);
      console.log('Tiles deleted successfully');

      if (labels.length > 0) {
        const labelIds = labels.map(l => l.id);
        await canvas.scene.deleteEmbeddedDocuments('Drawing', labelIds);
        console.log('Labels deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting tiles/labels:', error);
      ui.notifications.error('Error deleting tiles and labels');
      return;
    }

    // Clear stored tile IDs
    talismans[index].tileIds = [];
    await game.settings.set('cain', 'globalTalismans', talismans);

    ui.notifications.info(`Deleted ${tiles.length} tile(s) and ${labels.length} label(s) for ${talisman.name}`);
  }

  async _onUnpinTalisman(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index, 10);
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
    talismans.forEach((talisman, index) => {
      this._updateTile(talisman, index);
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

// Hook to update tiles when changing scenes
Hooks.on('canvasReady', async () => {
  console.log('Canvas ready - updating all talisman tiles in scene');

  // Only GM can update tiles and drawings
  if (!game.user.isGM) return;

  if (!canvas.scene) return;

  const talismans = game.settings.get('cain', 'globalTalismans');

  // Find all talisman tiles in the scene
  const talismanTiles = canvas.scene.tiles.filter(tile => tile.flags?.talismanData);

  console.log(`Found ${talismanTiles.length} talisman tiles in scene to update`);

  for (let tile of talismanTiles) {
    const tileIndex = tile.flags.talismanData.index;
    const currentTalisman = talismans[tileIndex];

    if (currentTalisman) {
      console.log(`Updating tile ${tile.id} with current talisman data from index ${tileIndex}`);

      // Update the tile with current global talisman data
      await tile.update({
        'texture.src': currentTalisman.imagePath,
        'flags.talismanData': {
          ...currentTalisman,
          index: tileIndex
        },
        'flags.talismanName': currentTalisman.name,
        'flags.talismanMarks': `${currentTalisman.currMarkAmount}/${currentTalisman.maxMarkAmount}`
      });

      // Update the associated label
      const labels = canvas.scene.drawings.filter(d =>
        d.flags?.cain?.talismanTileId === tile.id && d.flags?.cain?.talismanLabel
      );

      for (let label of labels) {
        await label.update({
          text: `${currentTalisman.name}\n${currentTalisman.currMarkAmount} / ${currentTalisman.maxMarkAmount}`
        });
      }
    }
  }

  console.log('Scene talisman tiles updated');
});

// Add click handler for talisman tiles to open the talisman window
Hooks.on('clickLeft', (tile, event) => {
  if (tile.document?.flags?.talismanData) {
    event.stopPropagation();
    const talismanData = tile.document.flags.talismanData;
    console.log('Talisman tile clicked:', talismanData);

    // Open the talisman window
    const talismanWindow = Object.values(ui.windows).find(app => app instanceof TalismanWindow);
    if (talismanWindow) {
      talismanWindow.render(true, { focus: true });
    } else {
      new TalismanWindow().render(true);
    }

    ui.notifications.info(`Talisman: ${talismanData.name} (${talismanData.currMarkAmount}/${talismanData.maxMarkAmount})`);
  }
});

// Add right-click context menu for talisman tiles
Hooks.on('getTileDirectoryEntryContext', (html, entryOptions) => {
  entryOptions.push({
    name: 'Update Talisman Tile',
    icon: '<i class="fas fa-sync"></i>',
    condition: li => {
      const tile = game.scenes.current.tiles.get(li.data('entryId'));
      return tile?.flags?.talismanData;
    },
    callback: async li => {
      const tile = game.scenes.current.tiles.get(li.data('entryId'));
      const talismanData = tile.flags.talismanData;
      const talismans = game.settings.get('cain', 'globalTalismans');
      const currentTalisman = talismans.find(t => t.name === talismanData.name);

      if (currentTalisman) {
        await tile.update({
          'texture.src': currentTalisman.imagePath,
          'flags.talismanData': currentTalisman,
          'flags.talismanName': currentTalisman.name,
          'flags.talismanMarks': `${currentTalisman.currMarkAmount}/${currentTalisman.maxMarkAmount}`
        });

        // Update the associated label
        const labels = canvas.scene.drawings.filter(d =>
          d.flags?.cain?.talismanTileId === tile.id && d.flags?.cain?.talismanLabel
        );
        for (let label of labels) {
          await label.update({
            text: `${currentTalisman.name}\n${currentTalisman.currMarkAmount} / ${currentTalisman.maxMarkAmount}`
          });
        }

        ui.notifications.info(`Updated tile for ${currentTalisman.name}`);
      }
    }
  });
});

// Hook to update label position when tile is moved or resized
Hooks.on('updateTile', async (tileDoc, changes, options, userId) => {
  // Only update if position or size changed and this is a talisman tile
  // Only GM can update drawings/labels
  if (!game.user.isGM) return;

  if ((changes.x !== undefined || changes.y !== undefined || changes.width !== undefined || changes.height !== undefined) && tileDoc.flags?.talismanData) {
    console.log('Talisman tile moved/resized, updating label position');
    console.log('Tile ID:', tileDoc.id);
    console.log('New position - x:', tileDoc.x, 'y:', tileDoc.y);
    console.log('New size - width:', tileDoc.width, 'height:', tileDoc.height);

    // Find the label drawing associated with this tile
    const labels = canvas.scene.drawings.filter(d =>
      d.flags?.cain?.talismanTileId === tileDoc.id && d.flags?.cain?.talismanLabel
    );

    console.log('Found labels:', labels.length);

    for (let label of labels) {
      const labelWidth = label.shape?.width || 200;
      const newX = tileDoc.x + (tileDoc.width / 2) - (labelWidth / 2);
      const newY = tileDoc.y + tileDoc.height + 5;

      console.log('Updating label from', label.x, label.y, 'to', newX, newY);

      try {
        await label.update({
          x: newX,
          y: newY
        });
        console.log('Label updated successfully');
      } catch (error) {
        console.error('Error updating label:', error);
      }
    }
  }
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