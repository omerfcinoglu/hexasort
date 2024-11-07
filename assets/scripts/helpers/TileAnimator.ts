import { Node, Vec3, tween, Quat } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';

export class TileAnimator {

    static async animateToPositionWithRotation(node: Node, targetPosition: Vec3, targetRotation: Quat, duration: number = 0.5): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .parallel(
                    tween().to(duration, { position: targetPosition }),
                    tween().to(duration, { rotation: targetRotation })
                )
                .call(resolve)
                .start();
        });
    }

    static async liftAndMoveToPosition(node: Node, liftHeight: number, finalPosition: Vec3, duration: number = 0.2): Promise<void> {
        const initialPosition = node.position.clone();
        const liftedPosition = new Vec3(initialPosition.x, initialPosition.y + liftHeight, initialPosition.z);
        await new Promise<void>((resolve) => {
            tween(node)
                .to(duration / 2, { position: liftedPosition })
                .call(() => {
                    tween(node)
                        .to(duration / 2, { position: finalPosition })
                        .call(resolve)
                        .start();
                })
                .start();
        });
    }

    static animateClusterPlacement(tileCluster: TileCluster, targetGround: GroundTile): Promise<void> {
        return new Promise((resolve) => {
            console.log("abc");
            
            const targetPosition = targetGround.node.position.clone();
            targetPosition.y += targetGround.getAllTileCount() * 0.2; // Yükseklik ayarlaması

            tween(tileCluster.node)
                .to(0.5, { position: targetPosition })
                .call(resolve)
                .start();
        });
    }
}
