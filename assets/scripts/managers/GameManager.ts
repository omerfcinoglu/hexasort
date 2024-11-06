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
               console.log(`matched ${tile.gridPosition.row}, ${tile.gridPosition.col}`);
               await this.animateClustersToStartTile(matchingClusters, startTile);
               return true;
          }

          return false;
     }
     private async animateClustersToStartTile(clusters: TileCluster[], startTile: GroundTile): Promise<void> {
          let cumulativeHeight = startTile.getAllTileCount() * 0.1 // Start tile'daki mevcut tile yüksekliğini baz al

          for (const cluster of clusters) {
               const targetPosition = startTile.node.position.clone();
               targetPosition.y += cumulativeHeight; // Yükseklik kümülatif olarak artacak şekilde konumlandır

               // Cluster'ı mevcut tile'dan kaldır ve startTile'ın çocuğu yap
               startTile.addTileCluster(cluster);

               // Animasyonla yeni hedef konuma taşı
               await new Promise<void>((resolve) => {
                    tween(cluster.node)
                         .to(0.5, { position: targetPosition })
                         .call(resolve)
                         .start();
               });

               // Cumulative height'ı artırarak bir sonraki cluster için yer aç
               cumulativeHeight += cluster.tileCount * 0.2; // Her bir tile yüksekliği kadar artır
          }
     }



     private handleMatch() {

     }
}
