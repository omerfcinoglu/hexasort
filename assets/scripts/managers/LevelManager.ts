import { _decorator, Component } from 'cc';
import { Level } from '../../data/level';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {

    private level: Level = new Level();

    onLoad() {
        const matrix = this.level.getLevelMatrix("level_1");
        if (matrix) {
            console.log("Loaded level matrix:", matrix);
            // Grid oluşturmak için `matrix` verisini kullanabilirsiniz.
        }
    }
}
