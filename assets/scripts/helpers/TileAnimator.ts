import { Node, Vec3, tween, Quat, EJoint2DType } from 'cc';
import { Tile } from '../entity/Tile';
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

    static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        const startPosition = cluster.node.position.clone();
        const endPosition = targetGround.node.position.clone();
        endPosition.y += (targetGround.getAllTileCount() + (Math.floor(cluster.getTiles().length/2))) * 0.2; 
        endPosition.y += 0.05;

        await new Promise<void>((resolve) => {
            tween(cluster.node)
                .to(0.5, { position: endPosition })
                .call(() => {
                    resolve();
                })
                .start();
        });
    }
}
