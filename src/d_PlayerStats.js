function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = '';
    this.level = 1;
    this.exp = 0;
    this.hp = 10;
    this.mHp = 10;
    this.mp = 0;
    this.mMp = 0;
    
    this.atk = '5D2';
    this.dfs = '5D2';
    this.spd = '5D2';
    this.luk = '5D2';
    this.int = '5D2';
    
    this.items = [];
}

module.exports = PlayerStats;