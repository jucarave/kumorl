function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = '';
    this.level = 1;
    this.exp = 0;
    this.hp = 10;
    this.mHp = 10;
    this.mp = 0;
    this.mMp = 0;
    
    this.atk = '2D3';
    this.dfs = '2D3';
    this.spd = '2D3';
    this.luk = '2D3';
    this.int = '2D3';
    
    this.items = [];
}

module.exports = PlayerStats;

PlayerStats.prototype.addItem = function(oItem){
    this.items.push(oItem);
    this.game.console.addMessage(oItem.name + " picked!");
    
    return true;
};