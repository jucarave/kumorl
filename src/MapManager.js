function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.map = null;
    
    this.loadMap(sMapName);
}

module.exports = MapManager;

MapManager.prototype.loadMap = function(sMapName){
    this.map = new Array(64);
    
    for (var i=0;i<64;i++){
        this.map[i] = new Uint8Array(64);
    }
};