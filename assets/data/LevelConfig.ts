export class LevelConfig {
    private static data = {
        1: {
            matrix: [
                [0, 0, 2, 2, 2],
                [0, 0, 2, 0, 2],
                [1, 1, 1, 2, 0],
                [1, 0, 1, 0, 0],
                [0, 1, 0, 0, 0],
            ],
            isSpecial: true,
            startTiles: {
                1: [
                    { tileType: 1, tileCount: 2 },
                    { tileType: 2, tileCount: 2 },
                ],
                2: [
                    { tileType: 2, tileCount: 2 },
                    { tileType: 1, tileCount: 2 },
                ],
                3: [
                    { tileType: 4, tileCount: 3 },
                    { tileType: 3, tileCount: 3 },
                ],
            },
        },
    };
  
    public static getLevelMatrix(level_id: number): number[][] | null {
      const level = this.data[level_id];
      if (level) {
        return level.matrix;
      } else {
        console.error(`Level ${level_id} not found`);
        return null;
      }
    }
  
    static isSpecial(level_id: number)  : boolean{
      const level = this.data[level_id]
      if (level.isSpecial) {
        return true;
      }
      return false;
    }

    static getStartTiles(level_id: number): { [key: number]: { tileType: number; tileCount: number }[] } | null {
        if(LevelConfig.isSpecial(level_id)){
            const level = this.data[level_id];
            if (level) {
                return level.startTiles;
            } else {
                return [];
            }
        }
        return [];
    }
  }
  