import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public hasTileCluster: boolean = false;

    private colliderNode: Node | null = null;

    onLoad() {
        this.colliderNode = this.node.getChildByName('Collider');
        if (!this.colliderNode) {
            console.error('Collider node not found in GroundTile.');
            return;
        }
        this.initializeCollider();
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

    public updateColliderState() {
        const collider = this.colliderNode!.getComponent(Collider);
        if (collider) {
            collider.enabled = !this.hasTileCluster;
        }
    }

    public addChildTileCluster(tileClusterNode: Node) {
        tileClusterNode.parent = this.node;
        tileClusterNode.setPosition(Vec3.ZERO);
        this.hasTileCluster = true;
        this.updateColliderState();
    }

    public removeChildTileCluster() {
        this.hasTileCluster = false;
        this.updateColliderState();
    }
}
