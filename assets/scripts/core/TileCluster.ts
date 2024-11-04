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
    public tileCount: number = 1;

    public isSelectable: boolean = true;
    public isDragging: boolean = false;
    public originalPosition: Vec3 = new Vec3();

    private tiles: Node[] = [];
    private touchOffset: Vec3 = new Vec3();

    public lastGroundTile : GroundTile = null;

    onLoad() {
        this.initializeCluster();
        this.originalPosition = this.node.getPosition().clone();
    }


    public initializeCluster() {
        for (let i = 0; i < this.tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.2, 0));

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.type = Math.floor(Math.random() * 4);
                tileComp.updateColor();
            }

            this.tiles.push(tileNode);
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
        newPosition.y += 0.2; // Y ekseninde yukarı konumlandırma için
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

    public moveToPosition(targetPosition: Vec3): Promise<void> {
        return new Promise((resolve) => {
            tween(this.node)
                .to(0.3, { position: targetPosition })
                .call(resolve)
                .start();
        });
    }
    

    public placement() : boolean {
        if (this.lastGroundTile) {
            this.node.removeFromParent();
            this.lastGroundTile.node.addChild(this.node);
            this.lastGroundTile.addTileCluster(this);

            const targetPosition = new Vec3(0,0.2,0)
            this.node.setPosition(targetPosition);
            
            this.isSelectable = false;
            this.isDragging = false;
            return true;
        } else {
            console.log("last ground tile is null");
            return false;
        }
    }
}
