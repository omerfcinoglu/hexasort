import {
  _decorator,
  Component,
  director,
  ERaycast2DType,
  PhysicsSystem,
} from "cc";
const { ccclass } = _decorator;

@ccclass("Level")
export class Level extends Component {
  private levelData = {
    level_1: {
      matrix: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 2, 0, 2, 0],
        [0, 0, 0, 0, 0],
      ],
    },
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
