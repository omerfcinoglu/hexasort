import { _decorator, Component } from 'cc';
import { GridManager } from './GridManager';
import { Level } from '../../data/level';

const { ccclass, property } = _decorator;

@ccclass("LevelManager")
export class LevelManager extends Component {
    @property(GridManager)
    public gridManager: GridManager = null!;

    private level = new Level();

    onLoad() {
        this.loadLevel("level_1");
    }

    // Belirtilen levelName için grid oluşturur ve yönetir
    loadLevel(levelName: string) {
        const matrix = this.level.getLevelMatrix(levelName);
        if (matrix) {
            this.gridManager.setGrid(matrix);
        } else {
            console.error(`Level ${levelName} not found in level data`);
        }
    }
}
