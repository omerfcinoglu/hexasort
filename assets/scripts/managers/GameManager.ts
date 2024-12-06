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
        const processingQueue: GroundTile[] = [initialGround];
        let groundsToStackCheck: GroundTile[] = [];
        
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || !currentGround.tryLock()) continue;
            try{
                const transferedGrounds = await this.neighborHandler?.processNeighbors(currentGround);
                if(transferedGrounds.length>0){
                    for (const ground of transferedGrounds) {
                        processingQueue.push(ground);
                        groundsToStackCheck.push(ground)
                    }
                }
                else{
                    this.processStack(groundsToStackCheck)
                    break;
                }
            }
            finally{
                currentGround.unlock();
            }
        }
    }
    
    private async handleNeighborProcessing(currentGround: GroundTile): Promise<GroundTile[]> {
        const neighbors = await this.neighborHandler.processNeighbors(currentGround);
        const allAffectedGrounds: GroundTile[] = [];
    
        // Transfer edilen GroundTile'ları sıraya ekle
        for (const ground of neighbors) {
            if (!allAffectedGrounds.includes(ground)) {
                allAffectedGrounds.push(ground);
            }
        }
    
        return allAffectedGrounds;
    }
    
    private async processStack(groundsToStackCheck: GroundTile[]) {
        const stackQueue: GroundTile[] = [...groundsToStackCheck].reverse();
        const alreadyProcessed = new Set<GroundTile>();
    
        while (stackQueue.length > 0) {
            const currentGround = stackQueue.shift();
            if (!currentGround || alreadyProcessed.has(currentGround)) continue;
    
            // Stack kontrolü yap
            const stackResults = await this.handleStackProcessing([currentGround]);
            alreadyProcessed.add(currentGround);
    
            // Stack sonrası boşalanları tekrar komşuluk kontrolüne ekle
            for (const stackedGround of stackResults) {
                if (!alreadyProcessed.has(stackedGround)) {
                    const newNeighbors = await this.handleNeighborProcessing(stackedGround);
                    stackQueue.push(...newNeighbors);
                }
            }
        }
    }
    
    
}
