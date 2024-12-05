import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { SelectableManager } from "./SelectableManager";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { LevelConfig } from "../../data/LevelConfig";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { SelectableTiles } from "../entity/SelectableTiles";
import { GroundTile } from "../entity/GroundTile";
import { StackHandler } from "../handlers/StackHandler";
import { NeighborHandler } from "../handlers/NeighborHandler";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    /** HANDLERS **/
    private tilePlacementHandler: TilePlacementHandler;
    private stackHandler: StackHandler;
    private neighborHandler: NeighborHandler;

    /** GAME INFO **/
    private level_id = 1;
    private MIN_STACK_COUNT = 10;

    start() {
        this.initializeHandlers();
        this.initializeGame();
    }

    private initializeHandlers() {
        this.tilePlacementHandler = new TilePlacementHandler();
        this.stackHandler = new StackHandler(this.MIN_STACK_COUNT);
        this.neighborHandler = new NeighborHandler();
    }

    private initializeGame() {
        this.setupLevel();
        this.setupEventListeners();
        console.log("Game initialized");
    }

    private setupLevel() {
        const levelMatrix = this.getLevelMatrix();
        if (this.gridManager) {
            this.gridManager.setGrid(levelMatrix);
        }

        const startTiles = LevelConfig.getStartTiles(this.level_id);
        if (this.selectableManager && startTiles) this.selectableManager.init(startTiles);
    }

    private setupEventListeners() {
        TileSelectionHandler.placementEvent.on("placement", this.onPlacementTriggered, this);
    }

    private getLevelMatrix(): number[][] {
        return [
            [0, 2, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 3, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];
    }

    private getStartTiles(): number[] {
        return [1, 2, 3];
    }

    async onPlacementTriggered(selectedTile: SelectableTiles) {
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            console.log(`Tile placed on: ${placedGround.gridPosition}`);
            await this.processPlacement(placedGround);
        }
    }

    private async processPlacement(initialGround: GroundTile) {
        const processingQueue: GroundTile[] = [initialGround];
        const stackQueue: GroundTile[] = [];

        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || !currentGround.tryLock()) continue;

            try {
                const neighbors = await this.handleNeighborProcessing(currentGround);

                // Current ground and neighbors added to processingQueue for another neighbor check
                processingQueue.push(...neighbors);

                // If no more neighbors, move ground to stack queue
                if (neighbors.length === 0) {
                    stackQueue.push(currentGround);
                }
            } finally {
                currentGround.unlock();
            }
        }

        // Process stack queue for remaining grounds
        await this.processStackQueue(stackQueue);
    }

    private async handleNeighborProcessing(currentGround: GroundTile): Promise<GroundTile[]> {
        const transferedGrounds = await this.neighborHandler.processNeighbors(currentGround);
        return transferedGrounds.filter(ground => ground !== currentGround);
    }

    private async processStackQueue(stackQueue: GroundTile[]) {
        while (stackQueue.length > 0) {
            const ground = stackQueue.shift();
            if (!ground || !ground.tryLock()) continue;

            try {
                const stackResults = await this.handleStackProcessing([ground]);
                stackQueue.push(...stackResults);
            } finally {
                ground.unlock();
            }
        }
    }

    private async handleStackProcessing(grounds: GroundTile[]): Promise<GroundTile[]> {
        const stackedInfo = await this.stackHandler.processStacks(grounds);
        return stackedInfo.map(info => info.groundTile);
    }
}
