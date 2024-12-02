import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { GroundTile } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { NeighborHandler } from "../handlers/NeighborHandler";
import { StackHandler } from "../handlers/StackHandler";
import { TaskQueue } from "../core/TaskQueue";
import { LevelConfig } from "../../data/LevelConfig";
import { ComboCounter } from "../helpers/ComboCounter";
import { ScoreManager } from "./ScoreManager";
const { ccclass, property } = _decorator;




/**
 * !TODO
 * REFACTOR HERE PLEASE!
 */



@ccclass("GameManager")
export class GameManager extends Component {

    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    private taskQueue: TaskQueue = new TaskQueue();
    private MIN_MATCH_STACK_COUNT: number = 10;
    private level_id = 1;

    tilePlacementHandler: TilePlacementHandler | null = null;
    neighborHandler: NeighborHandler | null = null;
    stackHandler: StackHandler | null = null;

    onLoad(): void {
        this.neighborHandler = new NeighborHandler();
        this.tilePlacementHandler = new TilePlacementHandler();
        this.stackHandler = new StackHandler(this.MIN_MATCH_STACK_COUNT);

        const levelMatrix = LevelConfig.getLevelMatrix(this.level_id);
        if (levelMatrix) this.gridManager?.setGrid(levelMatrix);

        const startTiles = LevelConfig.getStartTiles(this.level_id);
        if (this.selectableManager && startTiles) this.selectableManager.init(startTiles);

        TileSelectionHandler.placementEvent.on("placement", this.onPlacementTriggered, this);
    }

    onDestroy() {
        TileSelectionHandler.placementEvent.off("placement", this.onPlacementTriggered, this);

    }




    async onPlacementTriggered(selectedTile: SelectableTiles) {
        // const task = async () => {

        // };
        // this.taskQueue.add(task);
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            placedGround.highlight(false);
            await this.processPlacement(placedGround);
        }
    }

    private async processPlacement(initialGround: GroundTile) {
        const processingQueue: GroundTile[] = [initialGround];
        let popedTilesCounts : number[] = [];
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || !currentGround.tryLock()) continue;
    
            try {
                const transferedGrounds = await this.neighborHandler?.processNeighbors(currentGround) || [];
                if (transferedGrounds.length > 0) {
                    ComboCounter.getInstance().startCombo();
                }
    
                const stackedGroundInfo = await this.stackHandler?.processStacks(transferedGrounds) || [];
                if (stackedGroundInfo.length > 0) {
                    ComboCounter.getInstance().incrementCombo();
    
                    for (const info of stackedGroundInfo) {
                        popedTilesCounts.push(info.stackedCount)
                    }
                }
    
                const allGroundsToCheck = new Set(
                    [...transferedGrounds, ...stackedGroundInfo.map(info => info.groundTile)]
                );
    
                for (const ground of allGroundsToCheck) {
                    if (!processingQueue.includes(ground)) {
                        processingQueue.push(ground);
                    }
                }
    
                const selfStackedGroundInfo = await this.stackHandler?.processStacks([currentGround]) || [];
                if (selfStackedGroundInfo.length > 0) {
                    ComboCounter.getInstance().incrementCombo();
                    for (const info of stackedGroundInfo) {
                        popedTilesCounts.push(info.stackedCount)
                    }
                        
                    
                }
    
                for (const info of selfStackedGroundInfo) {
                    if (!processingQueue.includes(info.groundTile)) {
                        processingQueue.push(info.groundTile);
                    }
                }
            } finally {
                currentGround.unlock();
            }
        }
    
        this.AddScoreAndCheckGameStatus(popedTilesCounts);
    }

    private AddScoreAndCheckGameStatus(popedTilesCounts : number[]){
        let totalScore = 0;
        const comboCount = ComboCounter.getInstance().getComboCount();
        console.log(comboCount);
        
        popedTilesCounts.forEach(tilesCount => {
            const calculatedScore = ScoreManager.getInstance().calculateScore(comboCount,tilesCount , this.MIN_MATCH_STACK_COUNT)
            totalScore +=calculatedScore;
        });

        ScoreManager.getInstance().addScore(totalScore , comboCount >= 1)
        ComboCounter.getInstance().endCombo();
    }
}
