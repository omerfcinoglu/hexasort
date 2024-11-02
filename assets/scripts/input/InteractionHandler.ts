import { _decorator, Component, Node, Vec3, EventTouch, PhysicsSystem, Collider, ICollisionEvent } from 'cc';
import { InputProvider } from './InputProvider';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass("InteractionHandler")
export class InteractionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider = null!;

    private selectedTile: Tile | null = null;
    private resultGroundTile: GroundTile | null = null;
    private canPlaceTile: boolean = false;
    private resultTile: Tile | null = null;
    private canSelect: boolean = false;
    private originalPosition: Vec3 = new Vec3();
    private touchOffset: Vec3 = new Vec3();

    onLoad() {
        this.inputProvider.onRaycastResult = this.handleRaycastResult.bind(this);
        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);
    }

    handleRaycastResult(resultNode: Node | null) {
        if (resultNode) {

            const resultTileComp = resultNode.getComponent(Tile);
            if (resultTileComp && resultTileComp.isSelectable) {
                this.resultTile = resultTileComp;
                this.canSelect = true;
            }

            const groundTileComp = resultNode.getComponent(GroundTile);
            if (groundTileComp) {
                this.resultGroundTile = groundTileComp;
                this.canPlaceTile = true;
            }
        } else {
            this.canPlaceTile = false;
        }
    }

    handleTouchStart(event: EventTouch) {
        if (this.canSelect) {
            this.selectedTile = this.resultTile;
            this.originalPosition = this.selectedTile.node.getWorldPosition().clone();
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.touchOffset = this.originalPosition.subtract(touchWorldPos);
            this.selectedTile.select();
        }
    }

    handleTouchMove(event: EventTouch) {
        if (this.selectedTile && this.selectedTile.isDragging) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            const newPosition = touchWorldPos.add(this.touchOffset);
            this.selectedTile.node.setWorldPosition(newPosition);
            this.checkCollision(this.selectedTile.node);
        }
    }

    handleTouchEnd(event: EventTouch) {
        if (this.selectedTile && this.canPlaceTile && this.resultGroundTile) {
            this.resultGroundTile.addChildTile(this.selectedTile.node);
            this.selectedTile = null;
            this.resultGroundTile = null;
            this.canPlaceTile = false;
        }
    }

    private getTouchWorldPosition(event: EventTouch): Vec3 {
        this.inputProvider.cameraCom.screenPointToRay(event.getLocationX(), event.getLocationY(), this.inputProvider._ray);
        const distance = 25;
        return new Vec3(
            this.inputProvider._ray.o.x + this.inputProvider._ray.d.x * distance,
            this.inputProvider._ray.o.y + this.inputProvider._ray.d.y * 2,
            this.inputProvider._ray.o.z + this.inputProvider._ray.d.z * distance
        );
    }

    private checkCollision(tileNode: Node) {
        const collider = tileNode.getComponent(Collider);
        if (collider) {
            collider.on('onCollisionEnter', this.onTileCollision, this);
        }
    }

    private onTileCollision(event: ICollisionEvent) {
        const otherCollider = event.otherCollider;
        if (otherCollider.node.getComponent('GroundTile')) {
            console.log('Tile collided with GroundTile');
        }
    }
}
