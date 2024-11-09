import { _decorator, Color, Component, Node } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TileCluster } from "../core/TileCluster";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { Tile } from "../entity/Tile";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;

     private neighborChecker: NeighborChecker;
     private tileTransferHandler : TileTransferHandler;

     protected onLoad(): void {
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     protected start(): void {
          this.neighborChecker = new NeighborChecker();
          this.tileTransferHandler = new TileTransferHandler();
     }
     private async onPlacementTriggered(selectedCluster: TileCluster) {
          await this.handlePlacement(selectedCluster);
     }

     async handlePlacement(selectedCluster: TileCluster) {
          const placementSuccess = await this.tilePlacementHandler?.place(selectedCluster);
          if (placementSuccess) {
               const grid = this.gridManager.getGrid();
               const match = this.neighborChecker?.findFirstMatch(grid,selectedCluster.attachedGround);
               if (match) {
                    this.tileTransferHandler.transferClusterToTarget(match,selectedCluster.attachedGround);
               } else {
                    console.log("No match found.");
               }
          }
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }
}


