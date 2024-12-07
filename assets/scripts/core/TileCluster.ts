import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';

const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    @property({ type: Prefab })
    public tilePrefab: Prefab = null;

    public type: number = null;
    private tiles: Tile[] = [];

    initCluster(type: number, tileCount: number) {
        this.type = type;
        this.createTiles(tileCount);
    }

    private createTiles(tileCount: number) {
        for (let i = 0; i < tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.5, 0)); // Adjust spacing as needed
            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.init(this.type);
            }
            this.tiles.push(tileComp);
        }
    }

    getTiles(): Tile[] {
        return this.tiles;
    }

    getLength(): number {
        return this.tiles.length;
    }

    async transferTiles(tiles: Tile[]) {
        const transferCount = tiles.length;
        for (let i = 0; i < transferCount; i++) {
            const tile = tiles.pop();
            const targetPos = new Vec3(0, this.tiles.length * 0.5, 0); // Stack on top
            if (tile) {
                tile.node.parent = this.node;
                tile.node.setPosition(targetPos);
                this.tiles.push(tile);
            }
        }
    }

    async animateTransferToTarget(targetGround: GroundTile) {
        const worldPos = this.node.getWorldPosition();
        this.node.setParent(targetGround.node.parent);
        this.node.setWorldPosition(worldPos);
        tween(this.node)
            .to(0.5, { position: targetGround.node.position })
            .start();
    }
}
