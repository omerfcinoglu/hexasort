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
import { EventSystem } from "../utils/EventSystem";
import { Events } from "../../data/Events";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    private taskQueue: TaskQueue = new TaskQueue();
    private MATCH_STACK_COUNT: number = 10;
    private level_id = 1;

    tilePlacementHandler: TilePlacementHandler | null = null;
    neighborHandler: NeighborHandler | null = null;
    stackHandler: StackHandler | null = null;

    onLoad(): void {
        this.neighborHandler = new NeighborHandler();
        this.tilePlacementHandler = new TilePlacementHandler();
        this.stackHandler = new StackHandler(this.MATCH_STACK_COUNT);

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
        EventSystem.getInstance().emit(Events.CheckNeighbor);
        return;
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            placedGround.highlight(false);
            await this.processPlacement(placedGround);
        }
    }

    private async processPlacement(initialGround: GroundTile) {
        const processStackedGrounds = await this.handleTransferProcess(initialGround);
        await this.handleStackProcess(processStackedGrounds);
    }

    private async handleTransferProcess(initialGround : GroundTile){
        const processingQueue: GroundTile[] = [initialGround];
        let processTransferedGrounds: GroundTile[] = [];
        let processStackedGrounds: GroundTile[] = [];
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || !currentGround.tryLock()) continue;

            try {
                processTransferedGrounds = await this.neighborHandler?.processNeighbors(currentGround);
                for (const ground of processTransferedGrounds) {
                    if (!processingQueue.includes(ground)) {
                        processingQueue.push(ground);
                    }
                    processStackedGrounds.push(ground);
                }
            } finally {
                currentGround.unlock();
            }
        }
        return processStackedGrounds;
    }

    private async handleStackProcess(processStackedGrounds : GroundTile[]){
        const processingQueue: GroundTile[] = [...processStackedGrounds];
        const stackedGroundInfos = await this.stackHandler?.processStacks(processStackedGrounds);
        for (const info of stackedGroundInfos) {
            if (!processingQueue.includes(info.groundTile)) {
                processingQueue.push(info.groundTile);
            }
            processStackedGrounds.push(info.groundTile);
        }

        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            await this.handleTransferProcess(currentGround);
        }
    }
}