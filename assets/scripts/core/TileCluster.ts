// TileCluster.ts

import { _decorator, Component, Node, Vec3, tween, Prefab, instantiate, Collider, RigidBody, BoxCollider, PhysicsGroup, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    @property({ type: Prefab })
    public tilePrefab: Prefab = null!;

    @property
    public tileCount: number = 0;

    public isSelectable: boolean = true;
    public isDragging: boolean = false;
    public originalPosition: Vec3 = new Vec3();

    private tiles: Tile[] = [];
    private touchOffset: Vec3 = new Vec3();

    public type : number = null;
    public lastGroundTile : GroundTile = null;

    onLoad() {
        this.originalPosition = this.node.getPosition().clone();
    }
    public getTiles(): Tile[] {
        return this.tiles;
    }

    public initCluster(type:number , tileCount:number) {
        this.type = type
        this.createTile(tileCount);
    }

    private createTile(tileCount = this.tileCount){
        for (let i = 0; i < tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.2, -i * 0.01));

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.init(this.type);
            }

            this.tiles.push(tileComp);
        }
    }

    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) {
            return;
        }
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
    }

    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) {
            return;
        }
        const newPosition = touchWorldPos.add(this.touchOffset);
        newPosition.y += 0.2 ; // Y ekseninde yukarı konumlandırma için
        this.node.setWorldPosition(newPosition);
    }

    public deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.resetPosition();
    }

    public resetPosition() {
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }

    public placement() : boolean {
        if (this.lastGroundTile) {
            const position = this.lastGroundTile.node.position.clone();
            this.node.setPosition(position.add3f(0,0.2,0));
            this.lastGroundTile.addTileCluster(this);
            this.isSelectable = true;
            this.isDragging = false;
            return true;
        } else {
            console.log("last ground tile is null");
            return false;
        }
    }
}
