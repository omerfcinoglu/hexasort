import { _decorator, Component, Collider, ITriggerEvent, PhysicsSystem } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass } = _decorator;

@ccclass('CollisionHandler')
export class CollisionHandler extends Component {
    public collidedGroundTile: GroundTile | null = null;

    onEnable() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        } else {
            console.error('Collider component is missing on the node:', this.node.name);
        }
    }

    onDisable() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.off('onTriggerEnter', this.onTriggerEnter, this);
            collider.off('onTriggerExit', this.onTriggerExit, this);
        }
    }

    private onTriggerEnter(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile) {
            this.collidedGroundTile = groundTile;
            console.log('Entered collision with GroundTile:', groundTile.node.name);
        }
    }

    private onTriggerExit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile && this.collidedGroundTile === groundTile) {
            this.collidedGroundTile = null;
            console.log('Exited collision with GroundTile:', groundTile.node.name);
        }
    }
}
