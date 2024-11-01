import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('Level')
export class Level extends Component {

    private levelData = {
        "level_1": {
            "matrix": [
                [1, 1, 1, 1, 1], // Mavi satır
                [1, 1, 1, 1, 1], // Mavi satır
                [1, 1, 1, 1, 1], // Mavi satır
                [2, 2, 2, 2, 2], // Kırmızı satır
                [2, 2, 2, 2, 2]  // Kırmızı satır
            ]
        }
    };

    getLevelMatrix(levelName: string): number[][] | null {
        const level = this.levelData[levelName];
        if (level) {
            return level.matrix;
        } else {
            console.error(`Level ${levelName} not found`);
            return null;
        }
    }
}
