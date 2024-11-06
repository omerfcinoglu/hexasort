import { _decorator, Component, Node } from "cc";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { GridManager } from "./GridManager";
import { GroundTile } from "../entity/GroundTile";
import { TileCluster } from "../core/TileCluster";
import { NeighborChecker } from "../core/NeighborChecker";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(Node)
     private interactionHandler: Node;

     @property(Node)
     private gridManagerNode: Node;


     private tileSelectionHandler: TileSelectionHandler;
     private tilePlacementHandler: TilePlacementHandler;
     private gridManager: GridManager;
     private neighborChecker: NeighborChecker;


     start() {
          this.tileSelectionHandler = this.interactionHandler.getComponent(TileSelectionHandler)
          this.tilePlacementHandler = this.interactionHandler.getComponent(TilePlacementHandler);
          this.gridManager = this.gridManagerNode.getComponent(GridManager);

          this.tileSelectionHandler.onTileSelected(
               this.handleTileSelected.bind(this)
          );

          this.neighborChecker = new NeighborChecker(this.gridManager.getGrid());
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
               await this.gridManager.handlePlacementSuccess(targetGround);
               await this.triggerNeighborCheck(targetGround);
          }
     }

     private async triggerNeighborCheck(
          groundTile: GroundTile,
     ) {
          const neighbors = await this.neighborChecker.findNeighbors(groundTile);
          console.log("Komşular:", neighbors.map(neighbor => neighbor.gridPosition));
          
     }
}
