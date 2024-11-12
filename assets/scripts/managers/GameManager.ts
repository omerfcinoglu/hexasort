// GameManager.ts
import { _decorator, Component, Node, Color, CylinderCollider } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { GroundTile } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { TileAnimator } from "../helpers/TileAnimator";

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
     private processedGrounds: GroundTile[] = []; // Stores processed GroundTile objects

     onLoad(): void {
          // Initialize instances of `NeighborChecker` and `TileTransferHandler`
          this.neighborChecker = new NeighborChecker();
          this.tileTransferHandler = new TileTransferHandler();
          if (this.selectableManager) this.selectableManager.init();
          // Listen for selection events through `TileSelectionHandler`
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     onDestroy() {
          // Remove event listener to prevent memory leaks
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }

     /**
      * Called when a `SelectableTiles` object is triggered, initiating placement handling.
      * @param selectedTile The selected `SelectableTiles` object
      */
     async onPlacementTriggered(selectedTile: SelectableTiles) {
          await this.handlePlacement(selectedTile);
     }

     /**
      * Handles the placement process and checks neighbor tiles for potential matches.
      * @param selectedTile The `SelectableTiles` object being placed
      */
     async handlePlacement(selectedTile: SelectableTiles) {
          const placementSuccess = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (placementSuccess) {
               const grid = this.gridManager!.getGrid();
               const typeMatches = this.neighborChecker?.findAllMatches(grid, selectedTile) || [];
               const selectedTileGround = selectedTile.attachedGround;
               if (typeMatches.length > 0) {
                    console.log(typeMatches);
                    for (const matchGround of typeMatches) {
                         await this.tileTransferHandler?.transferClusterToTarget(
                              matchGround.lastAttachedCluster,
                              selectedTileGround!
                         );
                         this.processedGrounds.push(matchGround);
                    }
                    await this.processAfterTransfers();
               }
          }
     }

     /**
      * After transfers are processed, this function checks `processedGrounds` for additional matches.
      */
     private async processAfterTransfers() {
          const grid = this.gridManager!.getGrid();
          for (const ground of this.processedGrounds) {
               const neighbors = this.neighborChecker?.findNeighbors(grid, ground) || [];
               for (const neighbor of neighbors) {
                    if (!this.processedGrounds.some(g => g === neighbor)) {
                         const tileCount = neighbor.getAllTileCount();
                         if (tileCount >= this.matchStackCount) {
                              console.log(`Neighbor GroundTile at (${neighbor.gridPosition.row}, ${neighbor.gridPosition.col}) matches stack count with ${tileCount} tiles.`);
                              for (const cluster of neighbor.attachedClusters) {
                                   await TileAnimator.animateTilesToZeroScale(cluster.getTiles());
                              }

                         }
                    }
               }
          }
          this.processedGrounds = [];
     }
}
