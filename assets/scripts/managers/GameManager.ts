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

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;

     @property(SelectableManager)
     private selectableManager: SelectableManager | null = null;

     private matchStackCount: number = 7; // The maximum stack count required to form a match
     private neighborChecker: NeighborChecker | null = null;
     private tileTransferHandler: TileTransferHandler | null = null;

     onLoad(): void {
          this.neighborChecker = new NeighborChecker();
          this.tileTransferHandler = new TileTransferHandler();
          if (this.selectableManager) this.selectableManager.init();
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }

     async onPlacementTriggered(selectedTile: SelectableTiles) {
          await this.handlePlacement(selectedTile);
     }

     async handlePlacement(selectedTile: SelectableTiles) {
          const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (placedGround) {
               console.log(`neighbor checking started`);

               await this.processTypeMatches(placedGround);

               console.log(`neighbor checking ended`);
          }
     }

     // Komşuları kontrol eden ve transfer işlemlerini sırayla yöneten ana işlev
     private async processTypeMatches(currentGround: GroundTile) {
          const typeMatches = await this.neighborChecker?.findAllMatches(currentGround) || [];

          while (typeMatches.length > 0) {
               const match = typeMatches.shift();
               const { source, target } = this.determineTransferTarget(currentGround, match);

               if (source && target) {
                    console.log(`Transfer queued from (${source.gridPosition.row}, ${source.gridPosition.col}) to (${target.gridPosition.row}, ${target.gridPosition.col})`);
                    await this.tileTransferHandler?.transferClusterToTarget(source, target);
                    await sleep(300);
                    await this.processTypeMatches(source); 
               }
          }
     }

     private determineTransferTarget(ground1: GroundTile, ground2: GroundTile): { source: GroundTile, target: GroundTile } {
          const clusterCount1 = ground1.attachedClusters.length;
          const clusterCount2 = ground2.attachedClusters.length;

          if (clusterCount1 === 1 && clusterCount2 > 1) return { source: ground2, target: ground1 };
          if (clusterCount2 === 1 && clusterCount1 > 1) return { source: ground1, target: ground2 };

          if (clusterCount1 < clusterCount2) return { source: ground2, target: ground1 };
          if (clusterCount2 < clusterCount1) return { source: ground1, target: ground2 };

          return { source: ground2, target: ground1 };
     }
}
