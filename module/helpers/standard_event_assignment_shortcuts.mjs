
export class HTMLShortcut{
    constructor(setObj){
        this.htmlObj = setObj
    }

    setLeftClick(selector, func){
        this.htmlObj.find(selector).click(func);
    }
    
    setChange(selector, func){
        this.htmlObj.find(selector).change(func);
    }
    
    setRightClick(selector, func){
        this.htmlObj.find(selector).on('contextmenu', func);
    }
    
    setLeftAndRightClick(selector, funcLeft, funcRight){
        let obj = this.htmlObj.find(selector);
        obj.click(funcLeft);
        obj.on('contextmenu', funcRight);
    }
}
