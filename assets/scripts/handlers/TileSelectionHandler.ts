import { _decorator, Component, EventTouch, Vec3, Node, geometry, EventTarget } from 'cc';
import { InputProvider } from '../input/InputProvider';
import { SelectableTiles } from '../entity/SelectableTiles';

const { ccclass, property } = _decorator;

@ccclass('TileSelectionHandler')
export class TileSelectionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider | null = null;

    public selectedTile: SelectableTiles | null = null;
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

    private handleTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const touchPos3D = new Vec3(touchPos.x, touchPos.y, 0);
        const hitNode = this.performRaycast(touchPos3D);

        if (hitNode) {
            const selectableTile = this.getSelectableTileFromNode(hitNode);
            if (selectableTile && selectableTile.isSelectable) {
                const touchWorldPos = this.getTouchWorldPosition(event);
                selectableTile.select(touchWorldPos);
                this.selectedTile = selectableTile;
            }
        }
    }

    private handleTouchMove(event: EventTouch) {
        if (this.selectedTile) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.selectedTile.move(touchWorldPos);
        }
    }

    private handleTouchEnd(event: EventTouch) {
        if (this.selectedTile) {
            const placingTile = this.selectedTile;
            if (placingTile) {
                // Seçim tamamlandı, yerleştirme etkinliği tetiklenir.
                TileSelectionHandler.placementEvent.emit('placement', this.selectedTile);
            } else {
                this.selectedTile.deselect();
            }
            this.selectedTile = null;
        }
    }

    private getSelectableTileFromNode(node: Node): SelectableTiles | null {
        let currentNode: Node | null = node;
        while (currentNode) {
            const selectableTile = currentNode.getComponent(SelectableTiles);
            if (selectableTile) {
                return selectableTile;
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
