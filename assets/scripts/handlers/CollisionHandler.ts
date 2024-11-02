import { _decorator, Component, Collider, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass } = _decorator;

@ccclass('CollisionHandler')
export class CollisionHandler extends Component {
    public collidedGroundTile: GroundTile | null = null;

    onEnable() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    onDisable() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile) {
            this.collidedGroundTile = groundTile;
            console.log('Collision detected with GroundTile');
        }
    }
}
