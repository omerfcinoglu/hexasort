import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { SelectableManager } from "./SelectableManager";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { LevelConfig } from "../../data/LevelConfig";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { SelectableTiles } from "../entity/SelectableTiles";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    private tilePlacementHandler : TilePlacementHandler;
    private level_id = 1;

    start() {
        this.initializeHandlers();
        this.initializeGame();
    }

    private initializeHandlers(){
        this.tilePlacementHandler = new TilePlacementHandler();
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
        // Örnek seviye matrisi
        return [
            [0, 2, 0],
            [0, 0, 0],
            [1, 3, 1],
        ];
    }

    private getStartTiles(): number[] {
        // Örnek başlangıç taşları
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
    
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || !currentGround.tryLock()) continue;
    
            try {
                const neighbors = await this.handleNeighborProcessing(currentGround);
                const stackResults = await this.handleStackProcessing([currentGround, ...neighbors]);
    
                const groundsToCheck = new Set([...neighbors, ...stackResults]);
                for (const ground of groundsToCheck) {
                    if (!processingQueue.includes(ground)) {
                        processingQueue.push(ground);
                    }
                }
            } finally {
                currentGround.unlock();
            }
        }
    }
}
