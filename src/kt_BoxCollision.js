function BoxCollision(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this._boxCollision = true;
}

module.exports = BoxCollision;

BoxCollision.prototype.collidesWithBox = function(oBox){
    if (oBox.x + oBox.w <= this.x) return false;
    if (oBox.x >= this.x + this.w) return false;
    if (oBox.y + oBox.h <= this.y) return false;
    if (oBox.y >= this.y + this.h) return false;
    
    return true;
};

BoxCollision.prototype.update = function(x, y){
    this.x = x;
    this.y = y;
};