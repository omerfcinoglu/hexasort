// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3, PhysicsGroup, ICollisionEvent } from 'cc';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedTiles : Node[] = [];
    public colliderNode: Node | null = null;

    private collider : Collider = null;

    onLoad() {
        this.collider = this.getComponent(Collider);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);

        this.updateColliderState();
    }


    public updateColliderState() {
        if(this.attachedTiles.length > 0){
            this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.on('onCollisionExit', this.onCollisionExit, this);
            this.collider.off('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.off('onCollisionExit', this.onCollisionExit, this);
        }
        else{

        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            console.log("beni yerleştir konum" , this.gridPosition);
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            // Handle collision exit with TileCluster
        }
    }

    private onChildAdded(child: Node) {
        if (child !== this.colliderNode) {
            this.updateColliderState();
        }
    }

    private onChildRemoved(child: Node) {
        if (child !== this.colliderNode) {
            this.updateColliderState();
        }
    }

    public addChildTileCluster(tileClusterNode: Node) {
        const tileCount = this.attachedTiles.length + 1;
        const tileHeight = tileCount * 0.2; 
        
        this.attachedTiles.push(tileClusterNode);
        tileClusterNode.parent = this.node;
        tileClusterNode.setPosition(0, tileHeight, 0);
    }

    public removeChildTileCluster(tileClusterNode: Node) {
        //!arrayden çıkartacağız.
    }
}
