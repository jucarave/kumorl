var KT = require('./kt_Kramtech');

function Item(oMapManager, oPosition, oItem){
    this.mapManager = oMapManager;
    this.sprite = oMapManager.game.sprites.items;
    this.position = oPosition;
    this.item = oItem;
    
    this.destroyed = false;
    this._item = true;
}

module.exports = Item;

Item.prototype.draw = function(oCtx, oView){
    if (this.destroyed) return;
    if (!this.mapManager.isVisible(this.position.x, this.position.y)) return;
    
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32), this.item.imageIndex.x, this.item.imageIndex.y);
};

Item.prototype.update = function(){
    
};