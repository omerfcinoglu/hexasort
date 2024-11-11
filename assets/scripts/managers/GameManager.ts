import { _decorator, Color, Component, Node, } from "cc";
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

     async onPlacementTriggered(selectedCluster: TileCluster) {
          await this.handlePlacement(selectedCluster);
     }

     async handlePlacement(selectedCluster: TileCluster) {
          const placementSuccess = await this.tilePlacementHandler?.place(selectedCluster);
          if (placementSuccess) {
               const grid = this.gridManager.getGrid();
               const matches = this.neighborChecker.findAllMatches(grid, selectedCluster.attachedGround);
               if (matches) {
                    for (const matchGround of matches) {
                         await this.tileTransferHandler.transferClusterToTarget(matchGround.lastAttachedCluster, selectedCluster.attachedGround);
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

          // İşlem tamamlandıktan sonra dizi temizlenir
          this.processedGrounds = [];
     }
}


