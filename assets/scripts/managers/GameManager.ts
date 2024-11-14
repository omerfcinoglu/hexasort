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
import { TileCluster } from "../core/TileCluster";
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
          const targetGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (targetGround) {
               await sleep(500);
               console.log(`neighbor checking started`);
               
               const typeMatches = this.neighborChecker?.findAllMatches(targetGround) || [];
               await sleep(500);
               console.log(`neighbor checking ended`);

               await sleep(500);


               const selectedTileGround = selectedTile.attachedGround;
               if (typeMatches.length > 0) {
                    const processedGrounds: GroundTile[] = [];
                    for (const matchGround of typeMatches) {

                         //transfer kuralları
                         //aynı tipler ve başka clusterları yok. az olan çok olana doğru hareket etmeli
                         //az olan çoğa doğru hareket etmeli.
                         await this.tileTransferHandler?.transferClusterToTarget(
                              matchGround.lastAttachedCluster,
                              selectedTileGround!
                         );
                         processedGrounds.push(matchGround)
                    }
                    await this.processAfterTransfers(processedGrounds);
               }
          }
     }
     // ! todo placemnet olduktan sonra aktarılan yerlerde komşuluk kontrolü yapıp transfer tekrarı yapmamız gerekiyor
     /**
      * After transfers are processed, this function checks `processedGrounds` for additional matches.
      */
     async processAfterTransfers(initialProcessedGrounds: GroundTile[]) {
          const grid = this.gridManager!.getGrid();
          const queue: GroundTile[] = [...initialProcessedGrounds]; // Initialize with the first processed grounds

          while (queue.length > 0) {
               const currentGround = queue.shift();
               const neighbors = this.neighborChecker?.findNeighbors( currentGround) || [];

               for (const neighbor of neighbors) {
                    // Use `find` to check if the neighbor is already in the queue or initialProcessedGrounds
                    if (queue.find(g => g === neighbor) || initialProcessedGrounds.find(g => g === neighbor)) continue;

                    const tileCount = neighbor.getAllTileCount();
                    if (tileCount >= this.matchStackCount) {
                         for (const cluster of neighbor.attachedClusters) {
                              // Animate tiles to zero scale, indicating a match removal
                              await TileAnimator.animateTilesToZeroScale(cluster.getTiles());
                              // Remove the tile clusters after animation
                              neighbor.removeTileCluster(cluster);
                         }
                         queue.push(neighbor); // Add neighbor to queue to process its neighbors in next iterations
                    }
               }
          }
     }
}
