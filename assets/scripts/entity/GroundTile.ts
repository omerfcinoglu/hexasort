// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    
    public colliderNode: Node | null = null;

    onLoad() {
        this.colliderNode = this.node.getChildByName('Collider');
        if (!this.colliderNode) {
            console.error('Collider node not found in GroundTile.');
            return;
        }
        this.initializeCollider();

        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);

        this.updateColliderState();
    }

    private initializeCollider() {
        const collider = this.colliderNode!.getComponent(BoxCollider);
        if (!collider) {
            console.error('BoxCollider component missing on Collider node.');
            return;
        }
        collider.isTrigger = false;

        const rigidBody = this.colliderNode!.getComponent(RigidBody);
        if (rigidBody) {
            rigidBody.type = RigidBody.Type.STATIC;
            rigidBody.useGravity = false;
        } else {
            console.error('Rigidbody component missing on Collider node.');
            return;
        }
    }

    public setCollider(value : boolean){
        this.colliderNode.active = value;
    }

    public updateColliderState() {
        const collider = this.colliderNode!.getComponent(Collider);
        if (collider) {
            const hasChildren = this.node.children.some(child => child !== this.colliderNode);
            collider.enabled = !hasChildren;
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
        const tileCount = this.node.children.filter(child => child !== this.colliderNode).length;
        const tileHeight = tileCount * 0.2; // Adjust according to your tile height

        tileClusterNode.parent = this.node;
        tileClusterNode.setPosition(0, tileHeight, 0);
    }

    public removeChildTileCluster(tileClusterNode: Node) {
        tileClusterNode.removeFromParent();
    }
}
