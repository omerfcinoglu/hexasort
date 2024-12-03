interface LevelData {
    id: number;
    matrix: number[][];
    startTiles: { [key: number]: { tileType: number; tileCount: number }[] };
    isSpecial: boolean;
}

export class Level {
    id: number;
    matrix: number[][];
    startTiles: { [key: number]: { tileType: number; tileCount: number }[] };
    isSpecial: boolean;

    constructor(data: LevelData) {
        this.id = data.id;
        this.matrix = data.matrix;
        this.startTiles = data.startTiles;
        this.isSpecial = data.isSpecial;
    }
}