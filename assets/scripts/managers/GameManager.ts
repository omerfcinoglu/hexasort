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

    /**  HANDLERS **/
    private tilePlacementHandler : TilePlacementHandler;
    private stackHandler : StackHandler;
    private neighborHandler: NeighborHandler;

    /**  GAME INFO **/
    private level_id = 1;
    private MIN_STACK_COUNT = 10;

    start() {
        this.initializeHandlers();
        this.initializeGame();
    }

    private initializeHandlers(){
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
        // Örnek seviye matrisi
        return [
            [0, 2, 0 , 0 , 0],
            [0, 0, 0 , 0 , 0],
            [1, 3, 1 , 0 , 0],
            [0, 0, 0 , 0 , 0],
            [0, 0, 0 , 0 , 0],

        ];
    }

    private getStartTiles(): number[] {
        // Örnek başlangıç taşları
        return [1, 2, 3];
    }

    async onPlacementTriggered(selectedTile: SelectableTiles) {
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            await this.processPlacement(placedGround);
        }
    }


    private async handleStackProcessing(grounds: GroundTile[]): Promise<GroundTile[]> {
        const stackedInfo = await this.stackHandler.processStacks(grounds);
        return stackedInfo.map(info => info.groundTile);
    }


    private async processPlacement(initialGround: GroundTile) {
        // Ortak kuyruk
        const commonQueue: GroundTile[] = [initialGround];
        const processedGrounds = new Set<GroundTile>();
    
        while (commonQueue.length > 0) {
            const currentGround = commonQueue.shift();
            if (!currentGround || processedGrounds.has(currentGround) || !currentGround.tryLock()) continue;
    
            try {
                let hasAction = false;
    
                // Komşu transferlerini kontrol et
                const transferedGrounds = await this.neighborHandler.processNeighbors(currentGround);
                if (transferedGrounds.length > 0) {
                    hasAction = true; // Transfer tetiklendi
                    for (const ground of transferedGrounds) {
                        if (!processedGrounds.has(ground)) {
                            commonQueue.push(ground); // Transfer edilenleri kuyruğa ekle
                        }
                    }
                }
    
                // Eğer komşuluğunda type eşleşmesi yoksa stack işlemi yap
                const hasMatchingNeighbor = await this.neighborHandler.hasMatchingNeighbor(currentGround);
                if (!hasMatchingNeighbor) {
                    const stackResults = await this.handleStackProcessing([currentGround]);
                    if (stackResults.length > 0) {
                        hasAction = true; // Stack tetiklendi
                        for (const stackedGround of stackResults) {
                            if (!processedGrounds.has(stackedGround)) {
                                commonQueue.push(stackedGround); // Stack sonrası tekrar kuyruğa ekle
                            }
                        }
                    }
                }
    
                // Eğer hiçbir işlem yapılmadıysa, komşulara devam et
                if (!hasAction) {
                    const neighbors = await this.neighborHandler.getNeighbors(currentGround);
                    for (const neighbor of neighbors) {
                        if (!processedGrounds.has(neighbor)) {
                            commonQueue.push(neighbor); // Komşuları kuyruğa ekle
                        }
                    }
                }
            } finally {
                processedGrounds.add(currentGround);
                currentGround.unlock();
            }
        }
    
        // Kuyruk tamamen boşaldığında oyun yeni bir yerleştirme bekler
        console.log("Processing completed. Waiting for new placement...");
    }
    


    
    
}
