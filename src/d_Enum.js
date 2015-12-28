module.exports = {
    ACTOR: {
        STANDING: 0,
        MOVING: 1,
        DAMAGE: 2,
        END_TURN: 3
    },
    
    MAP: {
        PLAYER_TURN: 0,
        WORLD_TURN: 1,
        EVENT_TURN: 2
    },
    
    EVENT: {
        PLAY_ANIMATION: 0,
        CAST_DAMAGE: 1,
        WAIT_ACTOR: 2,
        ADD_HEALTH: 3,
        ADD_POSITION: 4,
        SET_HEALTH: 5,
        SET_POSITION: 6
    }
};