import { _decorator, Component, Collider, ITriggerEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass } = _decorator;

@ccclass('CollisionHandler')
export class CollisionHandler extends Component {
    public collidedGroundTile: GroundTile | null = null;

    onEnable() {
        const collider = this.getComponentInChildren(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
            collider.on('onTriggerExit', this.onTriggerExit, this);
        }
    }

    onDisable() {
        const collider = this.getComponentInChildren(Collider);
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
        }
    }

    private onTriggerExit(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);
        if (groundTile && this.collidedGroundTile === groundTile) {
            this.collidedGroundTile = null;
        }
    }
}
