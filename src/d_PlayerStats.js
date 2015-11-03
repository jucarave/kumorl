function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = 'Kram';
    this.level = 1;
    this.exp = 0;
    this.hp = 8;
    this.mHp = 10;
    this.mp = 3;
    this.mMp = 5;
    
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