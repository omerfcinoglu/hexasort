// TileCluster.ts

import { _decorator, Component, Node, Vec3, tween, Prefab, instantiate, Collider, RigidBody, BoxCollider, PhysicsGroup, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableManager } from '../managers/SelectableManager';
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
    private colliderNode: Node | null = null;
    private touchOffset: Vec3 = new Vec3();

    public selectableManager: SelectableManager | null = null;
    private collider : Collider = null;

    onLoad() {
        this.initializeCollider();
        this.initializeCluster();
        this.originalPosition = this.node.getPosition().clone();
    }

    private initializeCollider() {
        this.collider = this.getComponent(Collider);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);
    }

    public initializeCluster() {
        for (let i = 0; i < this.tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.2, 0));

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.type = Math.floor(Math.random() * 6);
                tileComp.updateColor();
            }

            this.tiles.push(tileNode);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const groundTile = event.otherCollider.node.getComponent(GroundTile);
        if (groundTile) {
            // Collision with GroundTile
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const groundTile = event.otherCollider.node.getComponent(GroundTile);
        if (groundTile) {
            // Collision exit with GroundTile
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
}
