// GameManager.ts
import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { GroundTile } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { sleep } from "../helpers/Promises";
import { TileAnimator } from "../helpers/TileAnimator";
import { NeighborHandler } from "../handlers/NeighborHandler";
import { StackHandler } from "../handlers/StackHandler";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(SelectableManager)
     selectableManager: SelectableManager | null = null;

     private MATCH_STACK_COUNT: number = 10;

     tilePlacementHandler: TilePlacementHandler | null = null;
     neighborHandler: NeighborHandler | null = null;
     stackHandler: StackHandler | null = null;

     onLoad(): void {
          this.neighborHandler = new NeighborHandler();
          this.tilePlacementHandler = new TilePlacementHandler();
          this.stackHandler = new StackHandler(this.MATCH_STACK_COUNT)
          if (this.selectableManager) this.selectableManager.init();
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }

     async onPlacementTriggered(selectedTile: SelectableTiles) {
          const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (placedGround) {
               placedGround.highlight(false);
               await this.processPlacement(placedGround);
          }
     }

     private async processPlacement(initialGround: GroundTile) {
          const processingQueue: GroundTile[] = [initialGround];

          while (processingQueue.length > 0) {
               const currentGround = processingQueue.shift();
               if (!currentGround || !currentGround.tryLock()) continue;
               try {
                    // console.log(`Processing ground (${currentGround.gridPosition.row}, ${currentGround.gridPosition.col})`);

                    const transferedGrounds = await this.neighborHandler?.processNeighbors(currentGround);
                    const stackedGrounds = await this.stackHandler?.processStacks(transferedGrounds);
                    const allGroundsToCheck = new Set([...transferedGrounds, ...stackedGrounds]);

                    for (const ground of allGroundsToCheck) {
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

