// GameManager.ts
import { _decorator, Component, Node, Color } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { GroundTile } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;

     private matchStackCount: number = 7;
     private neighborChecker: NeighborChecker;
     private tileTransferHandler: TileTransferHandler;
     private processedGrounds: GroundTile[] = [];

     onLoad(): void {
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }

     start(): void {
          this.neighborChecker = new NeighborChecker();
          this.tileTransferHandler = new TileTransferHandler();
     }

     async onPlacementTriggered(selectedTile: SelectableTiles) {
          await this.handlePlacement(selectedTile);
     }

     async handlePlacement(selectedTile: SelectableTiles) {
          const placementSuccess = await this.tilePlacementHandler?.place(selectedTile);
          if (placementSuccess) {
               return;
               const grid = this.gridManager.getGrid();
               const matches = this.neighborChecker.findAllMatches(grid, selectedTile.attachedGround);
               if (matches) {
                    for (const matchGround of matches) {
                         await this.tileTransferHandler.transferClusterToTarget(
                              matchGround.lastAttachedCluster,
                              selectedTile.attachedGround
                         );
                         this.processedGrounds.push(matchGround);
                    }
                    this.processAfterTransfers();
               }
          }
     }

     processAfterTransfers() {
          const grid = this.gridManager.getGrid();
          for (const ground of this.processedGrounds) {
               console.log(`Processed GroundTile at (${ground.gridPosition.row}, ${ground.gridPosition.col})`);

               const neighbors = this.neighborChecker.findNeighbors(grid, ground);
               for (const neighbor of neighbors) {
                    if (!this.processedGrounds.some(g => g === neighbor)) {
                         const tileCount = neighbor.getAllTileCount();
                         if (tileCount >= this.matchStackCount) {
                              console.log(`Neighbor GroundTile at (${neighbor.gridPosition.row}, ${neighbor.gridPosition.col}) matches stack count with ${tileCount} tiles.`);
                         }
                    }
               }
          }
          this.processedGrounds = [];
     }
}
