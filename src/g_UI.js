var KT = require('./kt_Kramtech.js');
var ItemFactory = require('./d_ItemFactory');
var Enum = require('./d_Enum');
var MapTurn = Enum.MAP;

module.exports = {
    game: null,
    drag: {
        item: null,
        anchor: null,
        slot: 0,
        fullDrag: false
    },
    mouse: {
        stat: 0,
        position: null,
        lastPosition: null,
        lastClick: 0
    },
    keys: {
        shift: 0
    },
    lastSlot: -1,
    
    uiLabels: ["Name",null,"Level","Exp","Next",null,"Health","Mana","Stamina",null,"Alchemy","Archery","Cookery","Crafting","Defense","Heavy Armor","Light Armor","Luck","One Handed","Speed","Strength","Two Handed","Wisdom"],
    uiStats: ["name",null,"level","exp","next",null,["hp","mHp"],["mp","mMp"],["stm","mStm"],null,"alch","arch","fdPv","crft","dfs","hvyA","lgtA","luk","oneH","spd","atk","twoH","wis"],
    uiStatsScroll: 10,
    
    uiPanels: [
        {x: 237, y: 432, w: 617, h: 470}
    ],
    
    _updatePlayerStats: true,
    
    init: function(oGame){
        this.drag.anchor = KT.Vector2.allocate(0, 0);
        this.mouse.position = KT.Vector2.allocate(-1, 0);
        this.mouse.lastPosition = KT.Vector2.allocate(-1, 0);
        this.game = oGame;
        
        var thus = this;
        oGame.inputObserver.register(function(oParams){ return thus.handleInput(oParams); });
    },
    
    handleInput: function(oParams){
        var Input = KT.Input;
        var map = this.game.map;
        
        switch (oParams.eventType){
            case Input.EV_MOUSE_DOWN:
                var onPanel = this.onUIPanel(Input.mouse.position);
                if (onPanel){
                    if (map.turn == MapTurn.PLAYER_TURN){
                        map.startUITurn();
                        
                        this.mouse.position.set(Input.mouse.position.x, Input.mouse.position.y);
                        this.mouse.stat = 1;
                        
                        return true;
                    }
                }
                break;
            
            case Input.EV_MOUSE_UP:
                if (map.turn == MapTurn.UI_TURN){
                    map.endTurn();
                    
                    this.mouse.stat = 3;
                    
                    return true;
                }
                break;
                
            case Input.EV_KEY_DOWN:
                if (oParams.keyCode == Input.vKeys.SHIFT){
                    this.keys.shift = 1;
                }
                break;
            
            case Input.EV_KEY_UP:
                if (oParams.keyCode == Input.vKeys.SHIFT){
                    this.keys.shift = 0;
                }
                break;
        }
        
        return false;
    },
    
    onUIPanel: function(oPosition){
        for (var i=0,len=this.uiPanels.length;i<len;i++){
            var panel = this.uiPanels[i];
            
            if (oPosition.x >= panel.x && oPosition.y >= panel.y && oPosition.x < panel.w && oPosition.y < panel.h){
                return true;
            }
        }
        
        return false;
    },
    
    updatePlayerStatsUI: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        var ctx = oGame.playerStatsSurface;
        
        Canvas.clearCanvas(ctx);
        
        var labels = this.uiLabels;
        var yy = -10;
        
        var len = Math.min(labels.length, this.uiStatsScroll + 15);
        for (var i=this.uiStatsScroll;i<len;i++){
            yy += 10;
            if (!labels[i]){ continue }
            
            Canvas.drawSpriteText(ctx, labels[i] + ":", oGame.sprites.f_font, 0, yy, 'aqua');
            
            var uiS = this.uiStats[i];
            var stat = oPlayer[uiS];
            if (uiS.push){
                stat = oPlayer[uiS[0]] + ' / ' + oPlayer[uiS[1]];
            }
            
            Canvas.drawSpriteText(ctx, stat, oGame.sprites.f_font, 90, yy);
        }
        
        this._updatePlayerStats = false;
    },
    
    drawoPlayerStats: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_playerMini, 8, 425, 0, 0);
        
        Canvas.drawSpriteText(oGame.ctx, oPlayer.name, oGame.sprites.f_font, 20, 437);
        
        var hp = oPlayer.hp / oPlayer.mHp;
        oGame.ctx.fillStyle = 'rgb(60,0,0)';
        oGame.ctx.fillRect(20, 451, 100, 5);
        oGame.ctx.fillStyle = 'rgb(122,0,0)';
        oGame.ctx.fillRect(20, 451, 100 * hp, 5);
        
        if (oPlayer.mMp > 0){
            var mp = oPlayer.mp / oPlayer.mMp;
            oGame.ctx.fillStyle = 'rgb(45,80,100)';
            oGame.ctx.fillRect(20, 460, 80, 3);
            oGame.ctx.fillStyle = 'rgb(90,155,200)';
            oGame.ctx.fillRect(20, 460, 80 * mp, 3);
        }
        
        if (this._updatePlayerStats) this.updatePlayerStatsUI(oGame, oPlayer);
        
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_playerStats, 8, 190, 0, 0);
        oGame.ctx.drawImage(oGame.playerStatsSurface.canvas, 170, 230);
    },
    
    drawInventory: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_inventory, 237, 432, 0, 0);
        
        var item;
        for (var i=0,len=oPlayer.items.length;i<len;i++){
            item = oPlayer.items[i];
            if (!item) continue;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, 240 + (i * 38), 435, item.ref.imageIndex.x, item.ref.imageIndex.y);
            
            if (item.ref.stack && item.amount > 1){
                Canvas.drawSpriteText(oGame.ctx, item.amount + "", oGame.sprites.f_font, 243 + (i * 38), 438);
            }
        }
        
        if (this.drag.item){
            item = this.drag.item;
            var pos = KT.Input.mouse.position;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, pos.x - this.drag.anchor.x + 3, pos.y - this.drag.anchor.y + 3, item.ref.imageIndex.x, item.ref.imageIndex.y);
        }
    },
    
    drawUI: function(oGame){
        oGame.console.render(oGame.ctx, 16, 16);
    
        oGame.map.drawAutoMap(712, 338);
        var player = oGame.party[0];
        
        this.drawoPlayerStats(oGame, player);
        this.drawInventory(oGame, player);
    },
    
    pickFromInventory: function(oGame, oPlayer){
        if (this.drag.item) return;
        var pos = KT.Input.mouse.position;
        
        var slot = ((pos.x - 237) / 38) << 0;
        var item = oPlayer.items[slot];
        
        if (!item){ return; }
        
        var name = item.ref.name.toLowerCase();
        if (item.status !== -1){
            name = ItemFactory.getStatusName(item.status) + ' ' + name;
        }
        
        if (this.mouse.lastClick > 0){
            oPlayer.useItem(slot);
            this.mouse.stat = 2;
            this.mouse.lastClick = 0;
            this.lastSlot = -1;
            this.mouse.lastPosition.set(-1, 0);
            return;
        }
        
        var msg = "A";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        if (this.mouse.lastPosition.x == -1 && this.mouse.stat == 1){
            oGame.console.addMessage(msg + ' ' + name);
            this.mouse.stat = 2;
        }
        
        if (this.mouse.lastPosition.x != -1 && !this.mouse.lastPosition.equalsVector2(pos)){
            var fullDrag = true;
            if (item.ref.stack && item.amount > 1 && !this.keys.shift == 1){
                var oldItem = item;
                item = ItemFactory.allocate(oldItem.ref, 1, oldItem.status);
                
                oldItem.amount -= 1;
                fullDrag = false;
            }else{
                oPlayer.items[slot] = null;
            }
            
            this.drag.item = item;
            this.drag.anchor.set(pos.x - (slot * 38 + 237), pos.y - 432);
            this.drag.slot = slot;
            this.drag.fullDrag = fullDrag;
            
            this.mouse.lastPosition.set(-1, 0);
            this.mouse.lastClick = 0;
            this.lastSlot = -1;
        }else{
            this.mouse.lastPosition.set(pos.x, pos.y);
            if (this.lastSlot == -1) this.lastSlot = slot;
        }
    },
    
    releaseDrag: function(oGame, oPlayer){
        var pos = KT.Input.mouse.position;
        var slot = ((pos.x - 237) / 38) << 0;
        
        if (this.drag.fullDrag && oPlayer.items[slot] && oPlayer.items[slot].ref.code != this.drag.item.ref.code){
            oPlayer.items[this.drag.slot] = oPlayer.items[slot];
            oPlayer.items[slot] = this.drag.item;
            this.drag.item = null;
            return;
        }
        var preSlot = oPlayer.items[slot];
        var item = oPlayer.addItemToSlot(this.drag.item, slot);
        if (item){
            item = oPlayer.addItemToSlot(this.drag.item, this.drag.slot);
            if (item) throw "Da fuq";
        }else if (preSlot){
            ItemFactory.free(this.drag.item);
        }
        
        this.drag.item = null;
    },
    
    destroyItem: function(oGame, oPlayer){
        var name = this.drag.item.ref.name;
        if (!this.drag.fullDrag){
            oGame.console.addMessage(name + ' destroyed', 'yellow');
            this.drag.item.amount -= 1;
            this.drag.item = null;
            return;
        }
        
        if (this.drag.item.amount > 1){
            name += ' (x' + this.drag.item.amount +')';
        }
        
        oGame.console.addMessage(name + ' destroyed', 'yellow');
        
        ItemFactory.free(this.drag.item);
        oPlayer.items[this.drag.slot] = null;
        this.drag.item = null;
    },
    
    checkAction: function(oGame){
        if (this.mouse.lastClick > 0) this.mouse.lastClick -= 1;
        
        var player = oGame.party[0];
        var pos = KT.Input.mouse.position;
        
        var invPanel = this.uiPanels[0];
        var onInventory = (pos.x >= invPanel.x && pos.y >= invPanel.y && pos.x < invPanel.w && pos.y < invPanel.h);
        
        if ((this.mouse.stat == 1 || this.mouse.stat == 2) && onInventory){
            this.pickFromInventory(oGame, player);
        }
        
        if (this.mouse.stat == 3){
            if (this.mouse.lastPosition.x != -1){
                this.mouse.lastPosition.set(-1, 0);
                this.mouse.lastClick = 10;
                this.lastSlot = -1;
            }
            
            if (this.drag.item != null){
                if (onInventory){
                    this.releaseDrag(oGame, player);
                }else{
                    //player.addItemToSlot(this.drag.item, this.drag.slot);
                    this.destroyItem(oGame, player);
                }
                
                this.drag.item = null;
            }
        }
    }
};