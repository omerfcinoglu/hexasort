import { _decorator, Component, Collider, ICollisionEvent } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableTiles } from '../entity/SelectableTiles';
import { GridManager } from '../managers/GridManager';

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
                GridManager.getInstance().resetHighlight();
                this.collidedGroundTile.highlight(true);
                selectableTiles.attachedGround = this.collidedGroundTile;
            }
        }
    }

    private onCollisionExit(event: ICollisionEvent) {
        const otherNode = event.otherCollider.node;
        const groundTile = otherNode.getComponent(GroundTile);

        if (groundTile && this.collidedGroundTile === groundTile) {
            const selectableTiles = this.node.getComponent(SelectableTiles);
            GridManager.getInstance().resetHighlight();

            this.collidedGroundTile = null;
            
            if (selectableTiles) {
                selectableTiles.attachedGround = this.collidedGroundTile;
            }
            
        }
    }
}
