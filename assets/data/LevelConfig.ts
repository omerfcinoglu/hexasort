import { Level } from "../scripts/core/Level";

export class LevelConfig {
    private static levels: Level[] = [
        new Level({
            id: 1,
            matrix: [
                [-1, -1, 0, -1, -1],
                [ 0,  0, 0,  0,  0],
                [ 0,  1, 2,  1,  0],
                [ 0,  0, 0,  0,  0],
                [-1,  0, 0,  0, -1],
            ],
            isSpecial: true,
            startTiles: {
                1: [
                    { tileType: 1, tileCount: 5 },
                    { tileType: 2, tileCount: 5 },
                ],
                2: [
                    { tileType: 2, tileCount: 2 },
                    { tileType: 1, tileCount: 2 },
                ],
                3: [
                    { tileType: 4, tileCount: 3 },
                    { tileType: 3, tileCount: 1 },
                ],
            },
        }),
    ];

    public static getLevelMatrix(level_id: number): number[][] | null {
        const level = this.levels.find(level => level.id === level_id);
        return level ? level.matrix : null;
    }

    public static isSpecial(level_id: number): boolean {
        const level = this.levels.find(level => level.id === level_id);
        return level ? level.isSpecial : false;
    }

    public static getStartTiles(level_id: number): { [key: number]: { tileType: number; tileCount: number }[] } | null {
        const level = this.levels.find(level => level.id === level_id);
        return level ? level.startTiles : null;
    }
}
