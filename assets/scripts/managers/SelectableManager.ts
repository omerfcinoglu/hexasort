import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    groundTilePrefab: Prefab = null!;

    @property(Node)
    public selectableArea: Node = null!;

    @property
    tileCount: number = 3; // Seçilebilir GroundTile sayısı

    private groundTiles: GroundTile[] = [];

    onLoad() {
        this.createSelectableGroundTiles();
    }

    createSelectableGroundTiles() {
        const startX = - (this.tileCount - 1) * 1.5; // X ekseninde başlangıç pozisyonu ayarı

        for (let i = 0; i < this.tileCount; i++) {
            const position = new Vec3(startX + i * 3, 0, 0); // Her bir tile'ın pozisyonu
            const groundTileNode = instantiate(this.groundTilePrefab);
            groundTileNode.parent = this.selectableArea;
            groundTileNode.setPosition(position.clone().add3f(10, 0, 0)); // Animasyon için başlangıç pozisyonu

            const groundTile = groundTileNode.getComponent(GroundTile);
            groundTile.isSelectable=true;
            if (groundTile) {
                this.groundTiles.push(groundTile);

                // Animasyon ile hedef pozisyona taşır
                tween(groundTileNode)
                    .to(0.5, { position: position })
                    .start();
            }
        }
    }

    // Belirli bir GroundTile seçildiğinde çağrılabilir
    removeGroundTile(groundTile: GroundTile) {
        const index = this.groundTiles.indexOf(groundTile);
        if (index !== -1) {
            this.groundTiles.splice(index, 1);
            groundTile.node.destroy();
            this.checkAndRefillGroundTiles();
        }
    }

    // Seçilebilir GroundTile sayısı azaldığında yenilerini oluşturur
    checkAndRefillGroundTiles() {
        if (this.groundTiles.length < this.tileCount) {
            this.createSelectableGroundTiles();
        }
    }
}
