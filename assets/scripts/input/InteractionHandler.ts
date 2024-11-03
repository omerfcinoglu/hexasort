import { _decorator, Component, EventTouch, Vec3, Node, tween, geometry } from 'cc';
import { InputProvider } from './InputProvider';
import { TileCluster } from '../core/TileCluster';
import { CollisionHandler } from '../handlers/CollisionHandler';
const { ccclass, property } = _decorator;

@ccclass('InteractionHandler')
export class InteractionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider | null = null;

    private selectedCluster: TileCluster | null = null;
    private collisionHandler: CollisionHandler | null = null;

    onLoad() {
        if (!this.inputProvider) {
            console.error("InputProvider is not assigned in InteractionHandler.");
            return;
        }

        // Input olaylarını ayarla
        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);

        console.log("InputProvider events bound to InteractionHandler.");
    }

    private handleTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const touchPos3D = new Vec3(touchPos.x, touchPos.y, 0);
        const hitNode = this.performRaycast(touchPos3D);

        if (hitNode) {
            console.log("Raycast hit node:", hitNode.name);
            const cluster = this.getTileClusterFromNode(hitNode);
            if (cluster && cluster.isSelectable) {
                const touchWorldPos = this.getTouchWorldPosition(event);
                cluster.select(touchWorldPos);
                this.selectedCluster = cluster;
                console.log("Selected cluster set:", this.selectedCluster.node.name);

                // CollisionHandler ekleyelim
                this.collisionHandler = cluster.node.getComponent(CollisionHandler);
                if (!this.collisionHandler) {
                    this.collisionHandler = cluster.node.addComponent(CollisionHandler);
                }
            } else {
                console.log("Cluster not found or not selectable.");
            }
        } else {
            console.log("Raycast did not hit any node.");
        }
    }

    private handleTouchMove(event: EventTouch) {
        if (this.selectedCluster) {
            const touchWorldPos = this.getTouchWorldPosition(event);
            this.selectedCluster.move(touchWorldPos);
        } else {
            console.log("No cluster selected during move.");
        }
    }

    private handleTouchEnd(event: EventTouch) {
        if (this.selectedCluster) {
            if (this.collisionHandler?.collidedGroundTile) {
                this.selectedCluster.placeOnGrid(this.collisionHandler.collidedGroundTile);
            } else {
                // Cluster'ın pozisyonunu sıfırla
                this.selectedCluster.resetPosition();
            }

            // CollisionHandler'ı kaldırın
            this.selectedCluster.node.removeComponent(CollisionHandler);
            this.collisionHandler = null;
            this.selectedCluster.deselect();
            this.selectedCluster = null;
        }
    }

    private getTileClusterFromNode(node: Node): TileCluster | null {
        let currentNode: Node | null = node;
        while (currentNode) {
            const components = currentNode.components.map(comp => comp.constructor.name);
            console.log("Components on node:", components);
            const cluster = currentNode.getComponent(TileCluster);
            if (cluster) {
                console.log("TileCluster found on node:", currentNode.name);
                return cluster;
            }
            currentNode = currentNode.parent;
        }
        console.log("TileCluster not found from node:", node.name);
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

        // Yükseklik değerini ayarlayın (örneğin, zemin seviyesinde olsun)
        const groundY = 0;

        // Dokunuş pozisyonunu dünya uzayında hesaplayın
        const distance = (groundY - ray.o.y) / ray.d.y;
        const worldPos = new Vec3(
            ray.o.x + ray.d.x * distance,
            groundY,
            ray.o.z + ray.d.z * distance
        );

        return worldPos;
    }
}
