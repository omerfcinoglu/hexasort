import { _decorator, Component, Node } from "cc";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { GridManager } from "./GridManager";
import { GroundTile } from "../entity/GroundTile";
import { TileCluster } from "../core/TileCluster";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(Node)
     private interactionHandler : Node;

     @property(Node)
     private gridManagerNode : Node;


     private tileSelectionHandler: TileSelectionHandler;
     private tilePlacementHandler: TilePlacementHandler;
     private gridManager: GridManager;


     start() {
          this.tileSelectionHandler  = this.interactionHandler.getComponent(TileSelectionHandler)
          this.tilePlacementHandler = this.interactionHandler.getComponent(TilePlacementHandler);
          this.gridManager = this.gridManagerNode.getComponent(GridManager);

          this.tileSelectionHandler.onTileSelected(
               this.handleTileSelected.bind(this)
          );
     }

     private async handleTileSelected(
          selectedCluster: TileCluster,
          targetGround: GroundTile
     ) {
          const placementSuccess = await this.tilePlacementHandler.place(
               selectedCluster,
               targetGround
          );
          if (placementSuccess) {
               console.log("placemnt success");
               //    const sameTypeCluster = this.gridManager.checkTopClusterType(targetGround);
               //    if (sameTypeCluster) {
               //        await this.triggerNeighborCheck(targetGround, sameTypeCluster);
               //    }
          }
     }

     private async triggerNeighborCheck(
          groundTile: GroundTile,
          cluster: TileCluster
     ) {
          return;
          const neighbors = await this.gridManager.findNeighbors(groundTile);
          for (const neighbor of neighbors) {
               if (this.gridManager.shouldMoveToNeighbor(neighbor, cluster)) {
                    await this.gridManager.moveClusterToNeighbor(neighbor, cluster);
                    this.triggerNeighborCheck(neighbor, cluster);
               }
          }
     }
}
