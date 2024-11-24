import { _decorator, Prefab, Vec3, Node, instantiate } from "cc";
import { GroundTile } from "../entity/GroundTile";
import { Tile } from "../entity/Tile";
import { TileCluster } from "./TileCluster";
import { ColorProvider } from "./ColorProvider";
const { ccclass, property } = _decorator;

@ccclass("GridGenerator")
export class GridGenerator {

    groundTilePrefab: Prefab;
    tileClusterPrefab: Prefab;
    tileSize: number;

    constructor(groundTilePrefab: Prefab, tileClusterPrefab: Prefab, tileSize: number) {
        this.groundTilePrefab = groundTilePrefab;
        this.tileClusterPrefab = tileClusterPrefab;
        this.tileSize = tileSize
    }
    public generateGrid(levelMatrix: number[][], gridArea: Node): GroundTile[][] {
        const grid: GroundTile[][] = [];
        const numRows = levelMatrix.length;
        const numCols = levelMatrix[0].length;
    
        // Define spacing adjustments
        const tileSpacingX = -0.05; // X-axis spacing adjustment for closer columns
        const tileSpacingZ = 0.04; // Z-axis spacing adjustment for row spacing
        const staggerOffset = -0.5; // Lowering offset for every even column
    
        // Calculate effective tile sizes with spacing adjustments
        const adjustedTileSizeX = this.tileSize + tileSpacingX;
        const adjustedTileSizeZ = this.tileSize + tileSpacingZ;
    
        // Calculating offsets to center the grid
        const offsetX = (numCols - 1) * adjustedTileSizeX * 0.5;
        const offsetZ = (numRows - 1) * adjustedTileSizeZ * 0.5;
    
        for (let row = 0; row < numRows; row++) {
            grid[row] = [];
            for (let col = 0; col < numCols; col++) {
                const tileType = levelMatrix[row][col];
                
                if(tileType === -1) continue;

                const adjustedX = col * adjustedTileSizeX - offsetX;
                const adjustedZ = -(row * adjustedTileSizeZ - offsetZ) + (col % 2 === 0 ? staggerOffset : 0);
    
                const position = new Vec3(adjustedX, 0, adjustedZ);
    
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
        const tileCluster = clusterNode.getComponent(TileCluster);
        if (tileCluster) {
            tileCluster.initCluster(tileType,3); 
            tileCluster.node.setPosition(new Vec3(groundTileNode.position.x, 0.1 ,groundTileNode.position.z))
            tileCluster.node.setParent(groundTileNode.parent);
            tileCluster.attachedGround = groundTileComp;

            groundTileComp.attachedClusters.push(tileCluster);
            groundTileComp.setActiveCollider(false);
            groundTileComp.isPlacedGround = true;
            // groundTileComp.addTileCluster(tileCluster);
        }
    }

}
