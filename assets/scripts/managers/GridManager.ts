import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass("GridManager")
export class GridManager extends Component {

    @property({ type: Prefab })
    public groundTilePrefab: Prefab = null!;

    @property({ type: Prefab })
    public tilePrefab: Prefab = null!;

    @property(Node)
    public gridArea: Node = null!;
    

    @property
    public tileSize: number = 1;

    private grid: GroundTile[][] = [];

    public createGrid(levelMatrix: number[][]): void {
        const numRows = levelMatrix.length;
        const numCols = levelMatrix[0].length;
        const offsetX = (numCols - 1) * this.tileSize * 0.5;
        const offsetZ = (numRows - 1) * this.tileSize * 0.5;

        for (let row = 0; row < numRows; row++) {
            this.grid[row] = [];
            for (let col = 0; col < numCols; col++) {
                const tileType = levelMatrix[row][col];
                const position = new Vec3(col * this.tileSize - offsetX, 0, -(row * this.tileSize - offsetZ));
                const groundTileNode = this.createGroundTile(position);
                const groundTileComp = groundTileNode.getComponent(GroundTile);
                if (groundTileComp) {
                    groundTileComp.gridPosition = { row, col };
                    this.grid[row][col] = groundTileComp;
                    if (tileType > 0) {
                        this.createLevelTile(tileType, groundTileNode, groundTileComp);
                    }
                }
            }
        }
    }

    private createGroundTile(position: Vec3): Node {
        const groundTileNode = instantiate(this.groundTilePrefab);
        groundTileNode.parent = this.gridArea;
        groundTileNode.setPosition(position);
        return groundTileNode;
    }

    private createLevelTile(tileType: number, groundTileNode: Node, groundTileComp: GroundTile): void {
        const tileNode = instantiate(this.tilePrefab);
        const tileComp = tileNode.getComponent(Tile);
        if (tileComp) {
            tileComp.type = tileType;
            tileComp.updateColor();
        }
        groundTileComp.addChildTileCluster(tileNode);
    }

    public getGroundTile(row: number, col: number): GroundTile | null {
        if (this.grid[row] && this.grid[row][col]) {
            return this.grid[row][col];
        }
        return null;
    }

    findNeighborsAndLog(lastGroundTile : GroundTile){
        console.log(lastGroundTile);
    }
    
    public resetGrid(): void {
        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node) {
                    groundTile.node.destroy();
                }
            });
        });
        this.grid = [];
    }
}
