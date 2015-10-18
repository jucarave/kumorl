module.exports = {
    enemies: {
        bat: { name: 'Giant bat', code: 'bat', hp: 20, atk: '3D2', dfs: '1D2' }
    },
    
    getEnemy: function(code){
        var enemy = this.enemies[code];
        if (!enemy) throw "Invalid enemy code: " + code;
        
        var ret = {};
        
        for (var i in enemy){
            ret[i] = enemy[i];
        }
        
        return ret;
    }
};