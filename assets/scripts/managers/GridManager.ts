import { _decorator, Component, Node, Vec3, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("GridManager")
export class GridManager extends Component {

    @property(Prefab)
    tilePrefab: Prefab = null!; // Tile prefabini ayarlayın



    @property
    rows: number = 5; // Satır sayısı

    @property
    cols: number = 5; // Sütun sayısı

    @property
    spacing: number = 1.2; // Tile'lar arasındaki boşluk

    private tiles: Node[][] = []; // 2D array to hold the tiles

    onLoad() {
        this.createGrid();
    }

    createGrid() {
        // Grid'in toplam genişlik ve yüksekliğini hesaplayarak ortalama yapmak için offset belirle
        const totalWidth = (this.cols - 1) * this.spacing;
        const totalHeight = (this.rows - 1) * this.spacing;

        for (let row = 0; row < this.rows; row++) {
            const rowTiles: Node[] = [];
            for (let col = 0; col < this.cols; col++) {
                const tile = this.createTile(row, col, totalWidth, totalHeight);
                rowTiles.push(tile);
            }
            this.tiles.push(rowTiles);
        }
    }

    createTile(row: number, col: number, totalWidth: number, totalHeight: number): Node {
        const tileNode = instantiate(this.tilePrefab); // Yeni bir Tile oluştur
        tileNode.parent = this.node; // Tile'ı gridArea altında konumlandır

        // Tile'ın gridArea içindeki pozisyonunu merkezlemek için offset uygula
        const x = (col * this.spacing) - totalWidth / 2;
        const y = 0;
        const z = row * this.spacing - totalHeight / 2;
        tileNode.setPosition(new Vec3(x, y, z));

        return tileNode;
    }
}