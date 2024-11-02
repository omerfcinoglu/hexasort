import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass("GridManager")
export class GridManager extends Component {

    @property(Prefab)
    public groundTilePrefab: Prefab = null!; // Ground tile prefab

    @property(Prefab)
    public tilePrefab: Prefab = null!; // Level tile prefab

    private tileSize = 1; // Tile'lar arasındaki mesafe

    public createGrid(levelMatrix: number[][]) {
        const offsetX = (levelMatrix[0].length - 1) * this.tileSize * 0.5;
        const offsetY = (levelMatrix.length - 1) * this.tileSize * 0.5;

        for (let row = 0; row < levelMatrix.length; row++) {
            for (let col = 0; col < levelMatrix[row].length; col++) {
                const tileType = levelMatrix[row][col];

                const groundTile = this.createGroundTile(row, col, offsetX, offsetY);
                const groundComp = groundTile.getComponent(GroundTile);
                
                if (tileType > 0) {
                    this.createLevelTile(tileType, groundTile , groundComp);
                    groundComp.updateColliderState();
                }
            }
        }
    }

    private createGroundTile(row: number, col: number, offsetX: number, offsetY: number): Node {
        const groundNode = instantiate(this.groundTilePrefab);
        groundNode.parent = this.node;

        const position = new Vec3(col * this.tileSize - offsetX, 0, -(row * this.tileSize - offsetY));
        groundNode.setPosition(position);

        const groundComponent = groundNode.getComponent(GroundTile);
        if (groundComponent) {
            groundComponent.type = 0;
            groundComponent.updateColor();
        }

        return groundNode;
    }

    private createLevelTile(type: number, groundTile: Node , groundComp: GroundTile) {
        const tileNode = instantiate(this.tilePrefab);
        tileNode.parent = groundTile;
        groundComp.addChildTile(tileNode);

        // Tile'ın yerel pozisyonunu ground üzerinde sıfırlayın
        tileNode.setPosition(0, 0.2, 0); // ground üzerinde hafif yukarıda

        const tileComponent = tileNode.getComponent(Tile);
        if (tileComponent) {
            tileComponent.type = type;
            tileComponent.updateColor();
        }
    }
}
