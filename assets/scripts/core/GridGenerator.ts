import { _decorator, Prefab, Vec3 , Node, instantiate} from "cc";
import { GroundTile } from "../entity/GroundTile";
import { Tile } from "../entity/Tile";
import { TileCluster } from "./TileCluster";
const { ccclass, property } = _decorator;

@ccclass("GridGenerator")
export class GridGenerator{

    groundTilePrefab: Prefab;
    tileClusterPrefab: Prefab;
    tileSize: number;

    constructor(groundTilePrefab : Prefab , tileClusterPrefab : Prefab , tileSize : number){
        this.groundTilePrefab = groundTilePrefab;
        this.tileClusterPrefab = tileClusterPrefab;
        this.tileSize = tileSize
    }

    public generateGrid(levelMatrix: number[][], gridArea: Node): GroundTile[][] {
        const grid: GroundTile[][] = [];
        const numRows = levelMatrix.length;
        const numCols = levelMatrix[0].length;
        const offsetX = (numCols - 1) * this.tileSize * 0.5;
        const offsetZ = (numRows - 1) * this.tileSize * 0.5;

        for (let row = 0; row < numRows; row++) {
            grid[row] = [];
            for (let col = 0; col < numCols; col++) {
                const tileType = levelMatrix[row][col];
                const position = new Vec3(col * this.tileSize - offsetX, 0, -(row * this.tileSize - offsetZ));
                const groundTileNode = this.createGroundTile(position, gridArea);
                const groundTileComp = groundTileNode.getComponent(GroundTile);

                if (groundTileComp) {
                    groundTileComp.gridPosition = { row, col };
                    grid[row][col] = groundTileComp;
                    if (tileType > 0) {
                        this.createLevelCluster(tileType, groundTileNode, groundTileComp);
                    }
                }
            }
        }
        return grid;
    }

    private createGroundTile(position: Vec3, gridArea: Node): Node {
        const groundTileNode = instantiate(this.groundTilePrefab);
        groundTileNode.parent = gridArea;
        groundTileNode.setPosition(position);
        return groundTileNode;
    }

    private createLevelCluster(tileType: number, groundTileNode: Node, groundTileComp: GroundTile): void {
        const clusterNode = instantiate(this.tileClusterPrefab);
        const clusterComp = clusterNode.getComponent(TileCluster);
        if (clusterComp) {
            clusterComp.initCluster(tileType , groundTileNode)
        }
    }
}
