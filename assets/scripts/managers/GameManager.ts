import { _decorator, Color, Component, Node } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TileCluster } from "../core/TileCluster";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;


     private neighborChecker: NeighborChecker;

     protected onLoad(): void {
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     protected start(): void {
          this.neighborChecker = new NeighborChecker();
     }
     private async onPlacementTriggered(selectedCluster: TileCluster) {
          await this.handlePlacement(selectedCluster);
     }

     async handlePlacement(selectedCluster: TileCluster) {
          // Placement ve eşleşme kontrol işlemleri burada gerçekleşecek
          const placementSuccess = await this.tilePlacementHandler?.place(selectedCluster);
          if (placementSuccess) {
               const grid = this.gridManager.getGrid();
               const match = this.neighborChecker?.findFirstMatch(grid,selectedCluster.lastGroundTile);
               if (match) {
                    console.log("Matching cluster found:", match);
                    // Aktarım işlemleri
               } else {
                    console.log("No match found.");
               }
          }
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }
}


