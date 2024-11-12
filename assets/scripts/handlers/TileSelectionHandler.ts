// TileSelectionHandler.ts
import { _decorator, Component, EventTouch, Vec3, Node, geometry, EventTarget } from 'cc';
import { InputProvider } from '../input/InputProvider';
import { SelectableTiles } from '../entity/SelectableTiles';

const { ccclass, property } = _decorator;

@ccclass('TileSelectionHandler')
export class TileSelectionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider | null = null; // Provides touch input capabilities

    public selectedTile: SelectableTiles | null = null; // Currently selected SelectableTiles
    public static placementEvent = new EventTarget(); // Event for signaling tile placement

    /**
     * Initializes the input handler on load.
     * Ensures that the InputProvider is set up and binds touch events.
     */
    onLoad() {
        if (!this.inputProvider) {
            console.error("InputProvider is not assigned in TileSelectionHandler.");
            return;
        }

        // Bind touch events to handler functions
        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Handles the start of a touch, checking if a SelectableTiles object was touched.
     * @param event The touch event triggered by the user.
     */
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

    /**
     * Handles touch movement, updating the position of the selected SelectableTiles.
     * @param event The touch move event.
     */
    private handleTouchMove(event: EventTouch) {
        if (this.selectedTile) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.selectedTile.move(touchWorldPos);
        }
    }

    /**
     * Handles the end of a touch, placing the SelectableTiles if applicable.
     * @param event The touch end event.
     */
    private handleTouchEnd(event: EventTouch) {
        if (this.selectedTile) {
            const placingTile = this.selectedTile.attachedGround;
            if (placingTile) {
                // Emit placement event for the selected tile
                TileSelectionHandler.placementEvent.emit('placement', this.selectedTile);
            } else {
                
                this.selectedTile.deselect();
            }
            this.selectedTile = null;
        }
    }

    /**
     * Searches for a SelectableTiles component on the given node or its parents.
     * @param node The node to start searching from.
     * @returns The SelectableTiles component if found, otherwise null.
     */
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

    /**
     * Performs a raycast to check for nodes at the specified screen position.
     * @param screenPos The screen position to raycast from.
     * @returns The node hit by the raycast, or null if no node is hit.
     */
    private performRaycast(screenPos: Vec3): Node | null {
        if (!this.inputProvider) {
            return null;
        }
        return this.inputProvider.performRaycast(screenPos);
    }

    /**
     * Converts the touch position from screen space to world space.
     * @param event The touch event.
     * @returns A Vec3 representing the world position of the touch.
     */
    private getTouchWorldPosition(event: EventTouch): Vec3 {
        const camera = this.inputProvider!.cameraCom!;
        const touchLocation = event.getLocation();
        const ray = new geometry.Ray();
        camera.screenPointToRay(touchLocation.x, touchLocation.y, ray);

        // Calculate world position by finding the intersection of the ray with the ground plane (Y = 0)
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
