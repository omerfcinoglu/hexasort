import { _decorator, Component, Collider, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass } = _decorator;

@ccclass('CollisionHandler')
export class CollisionHandler extends Component {
    public collidedGroundTile: GroundTile | null = null;

    onEnable() {
        const collider = this.getComponentInChildren(Collider);
        
        if (collider) {
            collider.on('onCollisionEnter', this.onCollisionEnter, this);
            collider.on('onCollisionExit', this.onCollisionExit, this);
        }
    }

    onDisable() {
        const collider = this.getComponentInChildren(Collider);
        if (collider) {
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
            collider.off('onCollisionExit', this.onCollisionExit, this);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile) {
            this.collidedGroundTile = groundTile;
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile && this.collidedGroundTile === groundTile) {
            this.collidedGroundTile = null;
        }
    }
}
