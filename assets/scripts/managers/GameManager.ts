import { _decorator, Component, Node } from "cc";
import { GridManager } from "./GridManager";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { NeighborChecker } from "../core/NeighborChecker";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(Node)
     private gridManagerNode: Node;

     private gridManager: GridManager;
     private neighborChecker: NeighborChecker;

     start() {
          this.gridManager = this.gridManagerNode.getComponent(GridManager);
          this.neighborChecker = new NeighborChecker(this.gridManager.getGrid());
     }

     // Tetikleyici ve gözlemci işlevlerini burada yönetiyoruz
     onTilePlacementSuccess(targetGround: GroundTile) {
          this.triggerNeighborCheck(targetGround);
     }

     private async triggerNeighborCheck(startTile: GroundTile) {
          const neighbors = await this.neighborChecker.findNeighbors(startTile);
          let matchFound = false;

          for (const neighbor of neighbors) {
               const matching = await this.checkMatchingNeighbors(neighbor, startTile);
               if (matching) {
                    matchFound = true;
               }
          }
          if (matchFound) {
               console.log("Matching clusters found. Animations started.");
          }
     }

     private async checkMatchingNeighbors(tile: GroundTile, startTile: GroundTile): Promise<boolean> {
          const lastCluster = startTile.lastAttachedCluster;
          if (!lastCluster) return false;

          const matchingClusters = tile.attachedCluster.filter(cluster =>
               cluster.type === lastCluster.type &&
               !(tile === startTile && cluster === lastCluster)
          );

          if (matchingClusters.length > 0) {
               await startTile.attachNewCluster(matchingClusters[0]);
               return true;
          }

          return false;
     }
}
