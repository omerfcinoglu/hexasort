import { _decorator, Component, EventTouch, Vec3, Node, tween, geometry } from 'cc';
import { InputProvider } from './InputProvider';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
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
        const distance = 10; // Scene ölçeğinize göre ayarlayın
        return new Vec3(
            ray.o.x + ray.d.x * distance,
            ray.o.y + ray.d.y * distance,
            ray.o.z + ray.d.z * distance
        );
    }
}
