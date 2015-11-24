function TileDefinition(x, y, solid){
    this.x = x;
    this.y = y;
    this.solid = solid;
}

module.exports = {
    tiles: {
        dungeon: [
            null,
            new TileDefinition(0, 0, true),
            new TileDefinition(1, 0, true),
            null,
            null,
            new TileDefinition(0, 1, false),
            new TileDefinition(1, 1, false),
            new TileDefinition(2, 1, false),
            new TileDefinition(3, 1, false),
            new TileDefinition(0, 2, false),
            new TileDefinition(1, 2, false),
            new TileDefinition(2, 2, false),
            null,
            null
        ]
    }
};