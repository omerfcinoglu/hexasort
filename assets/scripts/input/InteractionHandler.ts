import { _decorator, Component } from 'cc';
import { CollisionHandler } from '../handlers/CollisionHandler';
import { TileSelectionHandler } from '../handlers/TileSelectionHandler';
import { TilePlacementHandler } from '../handlers/TilePlacementHandler';
const { ccclass, property } = _decorator;

@ccclass('InteractionHandler')
export class InteractionHandler extends Component {
    @property(TileSelectionHandler)
    tileSelectionHandler: TileSelectionHandler | null = null;

    @property(TilePlacementHandler)
    tilePlacementHandler: TilePlacementHandler | null = null;

    private collisionHandler: CollisionHandler | null = null;

    onLoad() {
        if (!this.tileSelectionHandler || !this.tilePlacementHandler) {
            console.error("Handlers are not assigned in InteractionHandler.");
            return;
        }
    }

    update() {
        const selectedCluster = this.tileSelectionHandler!.selectedCluster;
        if (selectedCluster && selectedCluster.isDragging) {
            this.collisionHandler = selectedCluster.getComponent(CollisionHandler);
            if (this.collisionHandler?.collidedGroundTile) {
                // selectedCluster.placeOnGrid(this.collisionHandler.collidedGroundTile);
                // this.tileSelectionHandler!.selectedCluster = null;
            }
        }
    }
}
