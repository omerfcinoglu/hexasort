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
          const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (placedGround) {
               await sleep(500);
               console.log(`neighbor checking started`);

               const typeMatches = await this.neighborChecker?.findAllMatches(placedGround) || [];
               await sleep(500);
               console.log(`neighbor checking ended`);

               if (typeMatches.length > 0) {
                    console.log("typematches founded");
                    
                    await this.handleTypeMatches(typeMatches, placedGround)
               }
          }
     }


     private async handleTypeMatches(typeMatches: GroundTile[], placedGround: GroundTile) {
          const transferQueue: { source: GroundTile, target: GroundTile }[] = [];

          for (const match of typeMatches) {
               const target = this.determineTransferTarget(placedGround, match);
               console.log(target);
               
               if (target && match !== target) {
                    transferQueue.push({ source: match, target : target});
                    console.log(`Transfer queued from ${match.gridPosition} to ${target.gridPosition}`);
               }
          }
     }

     private determineTransferTarget(ground1: GroundTile, ground2: GroundTile): GroundTile {
          const clusterCount1 = ground1.attachedClusters.length;
          const clusterCount2 = ground2.attachedClusters.length;
          if (clusterCount1 === 1 && clusterCount2 > 1) return ground1;
          else if (clusterCount2 === 1 && clusterCount1 > 1) return ground2;
          else if (clusterCount1 <= clusterCount2) {
               return ground1
          }else{
               return ground2
          }
     }

}




 //typematch varsa matchler bir sıraya alınır.
                    //    GameManager sınıfımda bir yerleştirme (placement) işlemi sonrasında komşu kontrollerini ve belirli kurallar doğrultusunda 
                    // eşleşmeleri tetikleyen bir mekanik geliştirmek istiyorum. Şu akışı ve kuralları uygulayan bir yapıya ihtiyacım var:
                    // Eğer yerleştirilen veya komşu GroundTile nesnelerinden herhangi biri tek kümeli (single cluster) ise,  çok kümeli nesnelerin tek kümeli nesneye taşınması zorunludur.
                    // Eğer yerleştirilen veya komşu GroundTile nesnelerinden hangisinin  attachedTileClusters'ı  küçükse tilelar küçük olan ground tile'a transfer olmalıdır.
                    // Eğer yerleştirilen veya komşu GroundTile nesnelerin attachedTileClusters sayıları eşitse yerleştirlen ground'a tilelar transfer olmalıdır.

                    //Her TileCluster transferi işleminde transfer yapılan GroundTile nesnesinin stack kapasitesinin dolu olup olmadığını kontrol edilir.
                    //stack dolu ise tileAnimator.zero scale yapmak fonksiyonu ile görsel olarak stack yok edilir ve kullanıcı puan kazanır.
                    
                    //Herbir aktarımdan sonra. aktarım yapan ground tile, tıpkı placement olmuş gibi komşulukları ve transfer işlemlerinden geçmelidir.
                    //Yukarıdaki işlem sıraya sahip olmaları ve sırada işlemler bitene kadar devam etmelidir.
                    //Sıraya işlem eklenebilir olmalıdır.


                         // ! todo placemnet olduktan sonra aktarılan yerlerde komşuluk kontrolü yapıp transfer tekrarı yapmamız gerekiyor
     /**
      * After transfers are processed, this function checks `processedGrounds` for additional matches.
     async processAfterTransfers(initialProcessedGrounds: GroundTile[]) {
          // const grid = this.gridManager!.getGrid();
          // const queue: GroundTile[] = [...initialProcessedGrounds]; // Initialize with the first processed grounds

          // while (queue.length > 0) {
          //      const currentGround = queue.shift();
          //      const neighbors = this.neighborChecker?.findNeighbors( currentGround) || [];

          //      for (const neighbor of neighbors) {
          //           // Use `find` to check if the neighbor is already in the queue or initialProcessedGrounds
          //           if (queue.find(g => g === neighbor) || initialProcessedGrounds.find(g => g === neighbor)) continue;

          //           const tileCount = neighbor.getAllTileCount();
          //           if (tileCount >= this.matchStackCount) {
          //                for (const cluster of neighbor.attachedClusters) {
          //                     // Animate tiles to zero scale, indicating a match removal
          //                     await TileAnimator.animateTilesToZeroScale(cluster.getTiles());
          //                     // Remove the tile clusters after animation
          //                     neighbor.removeTileCluster(cluster);
          //                }
          //                queue.push(neighbor); // Add neighbor to queue to process its neighbors in next iterations
          //           }
          //      }
          // }
     }
      */
