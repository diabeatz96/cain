export class TalismanWindow extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'talisman-window',
      title: 'Talismans',
      template: 'systems/cain/templates/talisman-window.hbs',
      width: 1000,
      height: 600,
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
    }
  }

  async _onNameChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].name = value;
    await game.settings.set('cain', 'globalTalismans', talismans);
    this.render();
  }

  async _onAddTalisman(event) {
    event.preventDefault();
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans.push({
      name: 'New Talisman',
      imagePath: 'systems/cain/assets/Talismans/Talisman-A-0.png',
      currMarkAmount: 0,
      minMarkAmount: 0,
      maxMarkAmount: 6,
    });
    await game.settings.set('cain', 'globalTalismans', talismans);
    this.render();
  }

  async _onDeleteTalisman(event) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans.splice(index, 1);
    await game.settings.set('cain', 'globalTalismans', talismans);
    this.render();
  }

  async _onSliderChange(event) {
    const index = event.currentTarget.dataset.index;
    const value = event.currentTarget.value;
    const talismans = game.settings.get('cain', 'globalTalismans');
    talismans[index].currMarkAmount = parseInt(value, 10);
    const imagePath = talismans[index].imagePath;
    talismans[index].imagePath = imagePath.replace(/-(\d+)\.png$/, `-${value}.png`);
    await game.settings.set('cain', 'globalTalismans', talismans);
    this.render();
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
      this.render();
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
    this.render();
  }
}