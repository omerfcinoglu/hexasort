import { _decorator, Component, Collider, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableTiles } from '../entity/SelectableTiles';

const { ccclass } = _decorator;

@ccclass('CollisionHandler')
export class CollisionHandler extends Component {
    public collidedGroundTile: GroundTile | null = null;

    onEnable() {
        const collider = this.node.getComponent(Collider);
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
            
            const selectableTiles = this.node.getComponent(SelectableTiles);
            
            if (selectableTiles) {
                selectableTiles.attachedGround = this.collidedGroundTile;
            }

            this.collidedGroundTile.highlight(true);
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);

        if (groundTile && this.collidedGroundTile === groundTile) {
            // Vurguyu kaldır
            const selectableTiles = this.node.getComponent(SelectableTiles);
            this.collidedGroundTile.highlight(false);
            this.collidedGroundTile = null;
            
            if (selectableTiles) {
                selectableTiles.attachedGround = this.collidedGroundTile;
            }
        }
    }
}
