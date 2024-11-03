import { _decorator, Component } from 'cc';
import { TileSelectionHandler } from './TileSelectionHandler';
import { CollisionHandler } from '../handlers/CollisionHandler';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    @property(TileSelectionHandler)
    tileSelectionHandler: TileSelectionHandler | null = null;

    private collisionHandler: CollisionHandler | null = null;

    onLoad() {
        if (!this.tileSelectionHandler) {
            console.error("TileSelectionHandler is not assigned in TilePlacementHandler.");
            return;
        }
    }

    update() {
        const selectedCluster = this.tileSelectionHandler!.selectedCluster;
        if (selectedCluster && !this.collisionHandler) {
            this.addCollisionHandler(selectedCluster);
        } else if (!selectedCluster && this.collisionHandler) {
            this.removeCollisionHandler();
        }
    }

    private addCollisionHandler(cluster: TileCluster) {
        this.collisionHandler = cluster.node.getComponent(CollisionHandler);
        if (!this.collisionHandler) {
            this.collisionHandler = cluster.node.addComponent(CollisionHandler);
        }
    }

    private removeCollisionHandler() {
        if (this.collisionHandler) {
            this.collisionHandler.node.removeComponent(CollisionHandler);
            this.collisionHandler = null;
        }
    }
}
