import { _decorator, Component, EventTouch, Vec3, Node, geometry, Game, EventTarget } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { InputProvider } from '../input/InputProvider';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass('TileSelectionHandler')
export class TileSelectionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider | null = null;

    public selectedGroundTile: GroundTile | null = null;
    public static placementEvent = new EventTarget();

    onLoad() {
        if (!this.inputProvider) {
            console.error("InputProvider is not assigned in TileSelectionHandler.");
            return;
        }

        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);
    }

    onTileSelected(selectedCluster: TileCluster, targetGround: GroundTile) {
        if (selectedCluster && targetGround) {
        }
    }
    private handleTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const touchPos3D = new Vec3(touchPos.x, touchPos.y, 0);
        const hitNode = this.performRaycast(touchPos3D);

        if (hitNode) {
            const groundTile = this.getTileClusterFromNode(hitNode);
            if (groundTile && groundTile.isSelectable) {
                const touchWorldPos = this.getTouchWorldPosition(event);
                groundTile.select(touchWorldPos);
                this.selectedGroundTile = groundTile;
            }
        }
    }

    private handleTouchMove(event: EventTouch) {
        if (this.selectedGroundTile) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.selectedGroundTile.move(touchWorldPos);
        }
    }

    private handleTouchEnd(event: EventTouch) {
        if (this.selectedGroundTile) {
            const placingGroundTile = this.selectedGroundTile;
            if (placingGroundTile) {
                // selection done trigger Event.
                TileSelectionHandler.placementEvent.emit('placement', this.selectedGroundTile);
            }
            else {
                this.selectedGroundTile.deselect();
            }
            this.selectedGroundTile = null;
        }
    }

    private getTileClusterFromNode(node: Node): GroundTile | null {
        let currentNode: Node | null = node;
        while (currentNode) {
            const selectableGroundTile = currentNode.getComponent(GroundTile);
            if (selectableGroundTile) {
                return selectableGroundTile;
            }
            currentNode = currentNode.parent;
        }
        return null;
    }

    private performRaycast(screenPos: Vec3): Node | null {
        if (!this.inputProvider) {
            return null;
        }
        return this.inputProvider.performRaycast(screenPos);
    }

    private getTouchWorldPosition(event: EventTouch): Vec3 {
        const camera = this.inputProvider!.cameraCom!;
        const touchLocation = event.getLocation();
        const ray = new geometry.Ray();
        camera.screenPointToRay(touchLocation.x, touchLocation.y, ray);

        const groundY = 0;

        const distance = (groundY - ray.o.y) / ray.d.y;
        const worldPos = new Vec3(
            ray.o.x + ray.d.x * distance,
            groundY,
            ray.o.z + ray.d.z * distance
        );

        return worldPos;
    }
}
