var KT = require('./kt_Kramtech');

function PlayerInput(oGame){
    this.game = oGame;
    this.mouse = {
        position: KT.Vector2.allocate(0, 0),
        status: 0
    };
    this.keys = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        
        space: 0
    };
    
    var thus = this;
    oGame.inputObserver.register(function(oParams){ return thus.handleInput(oParams); });
}

module.exports = PlayerInput;

PlayerInput.prototype.handleInput = function(oParams){
    var Input = KT.Input;
    var mouse = Input.mouse;
    
    switch (oParams.eventType){
        case Input.EV_MOUSE_DOWN:
            this.setMouse(mouse.position, 1);
            break;
        
        case Input.EV_MOUSE_UP:
            this.setMouse(mouse.position, 0);
            break;
            
        case Input.EV_KEY_DOWN:
            this.setKey(oParams.keyCode, 1);
            break;
            
        case Input.EV_KEY_UP:
            this.setKey(oParams.keyCode, 0);
            break;
    }
    
    return false;
};

PlayerInput.prototype.setMouse = function(oPosition, istatus){
    this.mouse.position.set(oPosition.x, oPosition.y);
    this.mouse.status = istatus;
};

PlayerInput.prototype.setKey = function(iKeycode, istatus){
    var Input = KT.Input;
    switch (iKeycode){
        case Input.vKeys.W: this.keys.up = istatus; break;
        case Input.vKeys.A: this.keys.left = istatus; break;
        case Input.vKeys.S: this.keys.down = istatus; break;
        case Input.vKeys.D: this.keys.right = istatus; break;
        
        case Input.vKeys.SPACE: this.keys.space = istatus; break;
    }
};

PlayerInput.prototype.isKeyPressed = function(sKeyCode){
    if (this.keys[sKeyCode] == 1){
        this.keys[sKeyCode] = 2;
        return true;
    }
    
    return false;
};

PlayerInput.prototype.isKeyDown = function(sKeyCode){
    if (this.keys[sKeyCode] == 1){ return true; }
    return false;
};

PlayerInput.prototype.isMousePressed = function(){
    if (this.mouse.status == 1){
        this.mouse.status = 2;
        return true;
    }
    
    return false;
};

PlayerInput.prototype.isMouseDown = function(sKeyCode){
    if (this.mouse.status == 1){ return true; }
    return false;
};