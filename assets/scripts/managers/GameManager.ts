import { _decorator, Component, Node, tween, Vec3 } from "cc";
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
          this.tileSelectionHandler = this.interactionHandler.getComponent(TileSelectionHandler);
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
               await this.addClusterToGround(matchingClusters, startTile);
               return true;
          }

          return false;
     }

     async addClusterToGround(clusters: TileCluster[], startTile: GroundTile){
          for (let i = 0; i < clusters.length; i++) {
               const cluster = clusters[i];
               await startTile.attachNewCluster(cluster);
          }
     }
     private handleMatch() {

     }
}
