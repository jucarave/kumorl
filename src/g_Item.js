var KT = require('./kt_Kramtech');

function Item(oMapManager, oPosition, oItem, aParams){
    this.mapManager = oMapManager;
    this.sprite = oMapManager.game.sprites.items;
    this.position = oPosition;
    this.item = oItem;
    
    this.destroyed = false;
    this._item = true;
    this.solid = this.item.ref.solid;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 4;
    
    this.parseParams(aParams);
}

module.exports = Item;

Item.prototype.parseParams = function(aParams){
    if (!aParams) return;
    
    for (var i=0,len=aParams.length;i<len;i++){
        var par = aParams[i];
        
        if (par.type == 'light'){
            var lightPos = this.position.clone();
            if (par.dir == 'D') lightPos.sum(0, 1);
            else if (par.dir == 'R') lightPos.sum(1, 0);
            else if (par.dir == 'U') lightPos.sum(0, -1);
            else if (par.dir == 'L') lightPos.sum(-1, 0);
            
            this.mapManager.castLight(lightPos, 7);
            this.mapManager.lights.push(lightPos);
        }
    }
};

Item.prototype.draw = function(oCtx, oView){
    if (this.destroyed) return;
    if (!this.mapManager.isVisible(this.position.x, this.position.y)) return;
    
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32), this.item.ref.imageIndex.x + this.imageIndex, this.item.ref.imageIndex.y);
};

Item.prototype.update = function(){
    if (this.item.ref.imageNum){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.item.ref.imageNum){
            this.imageIndex = 0;
        }
    }
};