module.exports = {
    memLoc: [],
    
    enemies: {
        bat: { name: 'Giant bat', code: 'bat', hp: 20, atk: 2, dfs: 2 }
    },
    
    preAllocate: function(iAmount){
        this.memLoc = [];
        
        for (var i=0;i<iAmount;i++){
            this.memLoc.push({
                ref: null,
                hp: 0
            });
        }
    },
    
    allocate: function(oRef){
        if (this.memLoc.length == 0) throw "Out of Enemy Factory instances.";
        
        var enemy = this.memLoc.pop();
        
        enemy.ref = oRef;
        enemy.hp = oRef.hp;
        enemy.mHp = oRef.hp;
        
        return enemy;
    },
    
    free: function(oEnemy){
        oEnemy.ref = null;
        this.memLoc.push(oEnemy);
    },
    
    getEnemy: function(code){
        var enemy = this.enemies[code];
        if (!enemy) throw "Invalid enemy code: " + code;
        
        var ret = this.allocate(enemy);
        
        return ret;
    }
};