import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { NeighborHandler } from "../handlers/NeighborHandler";
import { StackHandler } from "../handlers/StackHandler";
import { LevelConfig } from "../../data/LevelConfig";
import { EventSystem } from "../utils/EventSystem";
import { Events } from "../../data/Events";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    private level_id = 1;

    tilePlacementHandler: TilePlacementHandler | null = null;
    private m_neighborHandler: NeighborHandler = new NeighborHandler();
    private m_stackHandler: StackHandler = new StackHandler(10);

    onLoad(): void {
        this.tilePlacementHandler = new TilePlacementHandler();

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
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            placedGround.highlight(false);
            await this.ProcessMarkedGroundTransfer(placedGround);
            return;
        }
    }


        async ProcessMarkedGroundTransfer(initialMarkedGround: GroundTile): Promise<void> {
            const markedGrounds = await this.ProcessTransfer([initialMarkedGround]);
    
            if (markedGrounds.size > 0) {
                const processedGrounds = Array.from(markedGrounds);
                await this.ProcessStack(processedGrounds);
            }
        }
    
        /**
         * Komşuluk Kontrolü ve Transfer İşlemleri
         */
        async ProcessTransfer(markedGrounds: GroundTile[]): Promise<Set<GroundTile>> {
            const processingQueue: GroundTile[] = [...markedGrounds];
            const processedGrounds: Set<GroundTile> = new Set();
    
            while (processingQueue.length > 0) {
                const currentGround = processingQueue.shift();
                if (!currentGround || processedGrounds.has(currentGround)) continue;
                
                try {
                    processedGrounds.add(currentGround);
                    const neighbors = await this.m_neighborHandler.processNeighbors(currentGround);
                    
                    neighbors.forEach((neighbor) => {
                        if (!processedGrounds.has(neighbor)) {
                            processingQueue.push(neighbor);
                        }
                    });
                } finally {
                }
            }
    
            return processedGrounds;
        }
    
        /**
         * Stack Kontrolü
         */
        async ProcessStack(processedGrounds: GroundTile[]): Promise<void> {
            let stackProcessedGrounds: GroundTile[] = [];
            stackProcessedGrounds = await this.m_stackHandler.processStacks(processedGrounds);
            
            if (stackProcessedGrounds.length > 0) {
                const markedGrounds = await this.ProcessTransfer(stackProcessedGrounds);
                if (markedGrounds.size > 0) {
                    await this.ProcessStack(Array.from(markedGrounds));
                }
            }
        }
}