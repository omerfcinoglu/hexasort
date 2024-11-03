import { _decorator, Component, EventTouch, Vec3, Node, geometry } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { InputProvider } from '../input/InputProvider';
import { TilePlacementHandler } from './TilePlacementHandler';
const { ccclass, property } = _decorator;

@ccclass('TileSelectionHandler')
export class TileSelectionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider | null = null;

    @property(TilePlacementHandler)
    tilePlacementHandler: TilePlacementHandler | null = null;

    
    public selectedCluster: TileCluster | null = null;

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
            const cluster = this.getTileClusterFromNode(hitNode);
            if (cluster && cluster.isSelectable) {
                const touchWorldPos = this.getTouchWorldPosition(event);
                cluster.select(touchWorldPos);
                this.selectedCluster = cluster;
            }
        }
    }

    private handleTouchMove(event: EventTouch) {
        if (this.selectedCluster) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.selectedCluster.move(touchWorldPos);
        }
    }

    private handleTouchEnd(event: EventTouch) {
        if (this.selectedCluster) {
            if(this.selectedCluster.lastGroundTile){
                this.tilePlacementHandler.Place(this.selectedCluster);
            }
            else{
                this.selectedCluster.deselect();
                this.selectedCluster = null;
            }
        }
    }

    private getTileClusterFromNode(node: Node): TileCluster | null {
        let currentNode: Node | null = node;
        while (currentNode) {
            const cluster = currentNode.getComponent(TileCluster);
            if (cluster) {
                return cluster;
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
