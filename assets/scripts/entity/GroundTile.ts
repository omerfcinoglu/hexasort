// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3, PhysicsGroup, ICollisionEvent } from 'cc';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedTiles : Node[] = [];

    private collider : Collider = null;

    onLoad() {
        this.collider = this.getComponent(Collider);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);

        this.updateColliderState();
    }


    public updateColliderState() {
        if(this.attachedTiles.length > 0){
            this.collider.off('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.off('onCollisionExit', this.onCollisionExit, this);
        }
        else{
            this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.on('onCollisionExit', this.onCollisionExit, this);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            // Handle collision with TileCluster
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            // Handle collision exit with TileCluster
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
