import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, Collider } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    @property({ type: Prefab })
    public tilePrefab: Prefab = null!;

    @property
    public tileCount: number = 0;

    private tiles: Tile[] = [];
    public type: number = null;
    public attachedGround: GroundTile | null = null;
    onLoad() {
    }

    public initCluster(type: number, tileCount: number) {
        this.type = type;
        this.createTiles(tileCount);
    }

    private createTiles(tileCount: number) {
        for (let i = 0; i < tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.2,  -(i+1) * 0.02));
            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.init(this.type);
            }
            this.tiles.push(tileComp);
        }
    }

    async transferTiles(tiles: Tile[]) {
        const tilesToAddCount = tiles.length;
        for (let i = 0; i < tilesToAddCount; i++) {
            const tile = tiles.pop();
            const worldPosition = tile.node.getWorldPosition();
            tile.node.removeFromParent();
            tile.node.setParent(this.node, true); 
            tile.node.setWorldPosition(worldPosition);
            this.tiles.push(tile);
        }
    }
    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }
    async isMatch() : Promise<boolean>  {
        if(this.tiles.length === 5){
            await TileAnimator.animateTilesToZeroScale(this.tiles);
            //!todo pool sistem yap
            this.node.setPosition(10,10,10);
            this.setActiveCollider(false);
            return true;
        }
        if(this.tiles.length === 0){
            this.node.active = false;
        }
        return false;
    }

    public getTiles(): Tile[] {
        return this.tiles;
    }

    public placed(targetGround:GroundTile){
        const tilesToAddCount = this.tiles.length;
        for (let i = 0; i < tilesToAddCount; i++) {
            const tile = this.tiles[i]
            const worldPosition = targetGround.node.getWorldPosition();
            tile.node.setWorldPosition(worldPosition);
        } 
    }
}
