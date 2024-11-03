// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3, ICollisionEvent, MeshRenderer, Color } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedTiles: Node[] = [];
    public colliderNode: Node | null = null;

    private collider: Collider = null;

    onLoad() {
        this.collider = this.getComponent(Collider);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);
        this.node.on(Node.EventType.CHILD_ADDED, this.onChildAdded, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this.onChildRemoved, this);
        this.changeBodyColor(ColorProvider.getInstance().getColor(6))
        this.updateColliderState();
    }

    public updateColliderState() {
        if (this.attachedTiles.length > 0) {
            this.collider.off('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.off('onCollisionExit', this.onCollisionExit, this);
        } else {
            this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
            this.collider.on('onCollisionExit', this.onCollisionExit, this);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            // Handle collision with TileCluster
            this.changeBodyColor(ColorProvider.getInstance().getColor(7));
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const tileCluster = event.otherCollider.node.getComponent(TileCluster);
        if (tileCluster) {
            // Handle collision exit with TileCluster
            this.changeBodyColor(ColorProvider.getInstance().getColor(6))

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
        const index = this.attachedTiles.indexOf(tileClusterNode);
        if (index > -1) {
            this.attachedTiles.splice(index, 1);
        }
        tileClusterNode.removeFromParent();
        this.updateColliderState();
    }

    public changeBodyColor(newColor: Color) {
        const body = this.node.getChildByName('Body');
        if (body) {
            const meshRenderer = body.getComponent(MeshRenderer);
            if (meshRenderer) {
                const material = meshRenderer.material;
                if (material) {
                    material.setProperty('albedo', newColor);
                } else {
                    console.error('Material not found on the body mesh renderer.');
                }
            } else {
                console.error('MeshRenderer not found on the body node.');
            }
        } else {
            console.error('Body node not found.');
        }
    }
}
