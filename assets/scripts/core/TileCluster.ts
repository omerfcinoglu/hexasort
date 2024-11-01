import { Node, Prefab, instantiate, Vec3, tween } from 'cc';
import { Tile } from '../entity/Tile';

export class TileCluster {
    private tiles: Node[] = [];
    public rootNode: Node;

    constructor(parent : Node ,tilePrefab: Prefab, tileCount: number, initialPosition: Vec3) {
        this.rootNode = new Node(); // Her TileCluster için yeni bir rootNode oluştur
        parent.addChild(this.rootNode); // Ana rootNode'a ekle
        this.rootNode.setPosition(initialPosition); // Başlangıç konumunu ayarla

        for (let i = 0; i < tileCount; i++) {
            const tile = this.createTile(tilePrefab, new Vec3(0, i * 1.2, 0)); // Başlangıç konumuna göre tile'ları hizala
            this.tiles.push(tile);
        }
    }

    createTile(tilePrefab: Prefab, localPosition: Vec3): Node {
        const tileNode = instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(Tile)
        tileNode.parent = this.rootNode;
        tileNode.setPosition(localPosition);
        tileComp.isSelectable = true;
        return tileNode;
    }

    moveToPosition(targetPosition: Vec3, duration: number): Promise<void> {
        return new Promise((resolve) => {
            tween(this.rootNode)
                .to(duration, { position: targetPosition })
                .call(resolve) // Hareket tamamlandığında Promise'i çözüme ulaştır
                .start();
        });
    }
}