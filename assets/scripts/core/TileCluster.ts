import { Node, Prefab, instantiate, Vec3, tween } from 'cc';
import { Tile } from '../entity/Tile';

export class TileCluster {
    private tiles: Node[] = [];
    public rootNode: Node;

    constructor(parent: Node, tilePrefab: Prefab, tileCount: number, initialPosition: Vec3 , isTileSelectable = false) {
        this.rootNode = new Node(); // Her TileCluster için yeni bir rootNode oluştur
        parent.addChild(this.rootNode);
        this.rootNode.setPosition(initialPosition);

        for (let i = 0; i < tileCount; i++) {
            const tileNode = this.createTile(tilePrefab, new Vec3(0, i * 0.3, 0.01 * i) , isTileSelectable);
            this.tiles.push(tileNode);
        }
    }

    createTile(tilePrefab: Prefab, localPosition: Vec3 , isTileSelectable : boolean): Node {
        const tileNode = instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(Tile);
        tileComp.isSelectable = isTileSelectable;
        tileNode.parent = this.rootNode;
        tileNode.setPosition(localPosition);
        return tileNode;
    }

    moveToPosition(targetPosition: Vec3, duration: number): Promise<void> {
        return new Promise((resolve) => {
            tween(this.rootNode)
                .to(duration, { position: targetPosition })
                .call(resolve)
                .start();
        });
    }

    async flipAnimation() {
        for (const tile of this.tiles) {
            await new Promise<void>((resolve) => {
                tween(tile)
                    .to(0.3, { eulerAngles: new Vec3(-180, 0, 0) }) // Y ekseni etrafında flip hareketi
                    .call(() => {
                        resolve();
                    })
                    .start();
            });
        }
    }
}
