import { _decorator, Color, Component, Node } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TileCluster } from "../core/TileCluster";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;


     private matchStackCount: number = 5;
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

     async onPlacementTriggered(selectedCluster: TileCluster) {
          await this.handlePlacement(selectedCluster);
     }

     // async handlePlacement(selectedCluster: TileCluster) {
     //      const placementSuccess = await this.tilePlacementHandler?.place(selectedCluster);
     //      if (placementSuccess) {
     //           const grid = this.gridManager.getGrid();
     //           const match = this.neighborChecker?.findFirstMatch(grid, selectedCluster.attachedGround);
     //           if (match) {
     //                await this.tileTransferHandler.transferClusterToTarget(match, selectedCluster.attachedGround);
     //           } else {
     //                console.log("No match found.");
     //           }
     //      }
     // }

     async handlePlacement(selectedCluster: TileCluster) {
          const placementSuccess = await this.tilePlacementHandler?.place(selectedCluster);
          if (placementSuccess) {
               const grid = this.gridManager.getGrid();
               const matches = this.neighborChecker.findAllMatches(grid, selectedCluster.attachedGround);

               // Tüm eşleşen komşular için transfer işlemini sırayla yap
               for (const matchGround of matches) {
                    console.log(selectedCluster.getTiles().length);
                    
                    await this.tileTransferHandler.transferClusterToTarget(matchGround.lastAttachedCluster, selectedCluster.attachedGround);

                    // İşlenen ground tile'ları işaretle
                    this.processedGrounds.push(matchGround);
                    console.log(selectedCluster.getTiles().length);

               }

               // Transfer işlemlerinden sonra `processedGrounds` dizisi üzerinde işlemler
               this.processAfterTransfers();
          }
     }

     // İşlem yapılmış ground tile'lar üzerinde işlem yapılır
     processAfterTransfers() {
          for (const ground of this.processedGrounds) {
               console.log(`Processed GroundTile at (${ground.gridPosition.row}, ${ground.gridPosition.col})`);
               // Burada gerekli işlemleri yapabilirsiniz
          }

          // İşlem tamamlandıktan sonra dizi temizlenir
          this.processedGrounds = [];
     }
}


