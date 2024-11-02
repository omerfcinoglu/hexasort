import { _decorator, Component, EventTouch, geometry, Vec3 } from 'cc';
import { InputProvider } from '../input/InputProvider';
import { TileSelectionHandler } from '../handlers/TileSelectionHandler';
import { TilePlacementHandler } from '../handlers/TilePlacementHandler';
import { CollisionHandler } from '../handlers/CollisionHandler';
import { Tile } from '../entity/Tile';
const { ccclass } = _decorator;

@ccclass("InputManager")
export class InputManager extends Component {
    private inputProvider: InputProvider | null = null;
    private tileSelectionHandler: TileSelectionHandler = new TileSelectionHandler();
    private tilePlacementHandler: TilePlacementHandler = new TilePlacementHandler();
    private collisionHandler: CollisionHandler | null = null;
    private touchOffset: Vec3 = new Vec3();

    onLoad() {
        this.inputProvider = this.getComponent(InputProvider);
        if (!this.inputProvider) {
            console.error("InputProvider not found on InputManager node.");
            return;
        }

        // Set up input event listeners
        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);
    }

    private handleTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const hitNode = this.inputProvider!.performRaycast(new Vec3(touchPos.x, touchPos.y, 0));

        if (hitNode) {
            const tile = hitNode.getComponent(Tile);
            if (tile) {
                this.tileSelectionHandler.handleTileSelection(tile);
                const tilePos = tile.node.getWorldPosition();
                const touchWorldPos = this.getTouchWorldPosition(event);
                this.touchOffset = tilePos.subtract(touchWorldPos);

                // Attach CollisionHandler to the tile
                this.collisionHandler = tile.node.addComponent(CollisionHandler);
            }
        }
    }

    private handleTouchMove(event: EventTouch) {
        const selectedTile = this.tileSelectionHandler.getSelectedTile();
        if (selectedTile) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            const newPosition = touchWorldPos.add(this.touchOffset);
            selectedTile.node.setWorldPosition(newPosition);
        }
    }

    private handleTouchEnd(event: EventTouch) {
        const selectedTile = this.tileSelectionHandler.getSelectedTile();
        if (selectedTile) {
            if (this.collisionHandler?.collidedGroundTile) {
                this.tilePlacementHandler.handleTilePlacement(selectedTile, this.collisionHandler.collidedGroundTile);
            } else {
                this.tileSelectionHandler.resetSelection();
            }

            // Remove CollisionHandler from the tile
            selectedTile.node.removeComponent(CollisionHandler);
            this.collisionHandler = null;
            this.tileSelectionHandler.resetSelection();
        }
    }

    private getTouchWorldPosition(event: EventTouch): Vec3 {
        const camera = this.inputProvider!.cameraCom!;
        const touchLocation = event.getLocation();
        const ray = new geometry.Ray();
        camera.screenPointToRay(touchLocation.x, touchLocation.y, ray);
        const distance = 10; // Adjust based on your scene scale
        return new Vec3(
            ray.o.x + ray.d.x * distance,
            ray.o.y + ray.d.y * distance,
            ray.o.z + ray.d.z * distance
        );
    }
}
