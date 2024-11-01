import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass("GridManager")
export class GridManager extends Component {

    @property(Prefab)
    public tilePrefab: Prefab = null!; // Her bir Tile için prefab

    private tileSize = 1.5; // Tile'lar arasındaki mesafe

    // Level verisi olarak 0 ve 6 arasında sayılar içeren 2D bir matrix alır
    public createGrid(matrix: number[][]) {
        // Grid’i merkezlemek için offset hesapla
        const offsetX = (matrix[0].length - 1) * this.tileSize * 0.5;
        const offsetY = (matrix.length - 1) * this.tileSize * 0.5;

        // Grid’i oluştur
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                const tileType = matrix[row][col];
                if (tileType > 0) { // 0 olmayan değerlere göre tile oluştur
                    this.createTile(tileType, row, col, offsetX, offsetY);
                }
            }
        }
    }

    private createTile(type: number, row: number, col: number, offsetX: number, offsetY: number) {
        const tileNode = instantiate(this.tilePrefab);
        tileNode.parent = this.node;

        // Tile’ın pozisyonunu hesapla ve offset uygula
        const position = new Vec3(col * this.tileSize - offsetX, 0 , -(row * this.tileSize - offsetY));
        tileNode.setPosition(position);

        // Tile bileşenine type ve renk ata
        const tileComponent = tileNode.getComponent(Tile);
        if (tileComponent) {
            tileComponent.type = type;
            tileComponent.updateColor(); // Rengi güncelle
        }
    }
}
