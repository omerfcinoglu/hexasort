import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {

    private levelData = {
        "level_1": {
            "matrix": [
                [1, 2, 3, 4, 5],
                [2, 0, 0, 5, 3],
                [3, 0, 6, 0, 2],
                [4, 5, 0, 0, 1],
                [6, 4, 3, 2, 1]
            ]
        }
    };

    getLevelMatrix(levelName: string) {
        const level = this.levelData[levelName];
        if (level) {
            return level.matrix;
        } else {
            console.error(`Level ${levelName} not found`);
            return null;
        }
    }
}
