import { Node, Vec3, tween, Quat } from 'cc';
import { Tile } from '../entity/Tile';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';

export class TileAnimator {

    static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile, direction: string): Promise<void> {
        const tiles = cluster.getTiles();
        const baseTargetPosition = targetGround.node.worldPosition.clone();
        const tileCount = targetGround.getAllTileCount();
        
        let cumulativeHeight = (tileCount + 1) * 0.2;

        for (let i = tiles.length - 1; i >= 0; i--) {
            const tile = tiles[i];
            const targetPosition = new Vec3(baseTargetPosition.x, cumulativeHeight + 0.1, baseTargetPosition.z + (i*0.02));
            console.log(targetPosition);
            
            const liftedPosition = new Vec3(tile.node.position.x, cumulativeHeight + 1, tile.node.position.y);
            const targetRotation = TileAnimator.getRotationForDirection('left');

            await new Promise<void>((resolve) => {
                tween(tile.node)
                    .parallel(
                        tween().to(0.1, { position: liftedPosition }, { easing: 'cubicOut' }),
                        tween().to(0.125, { rotation: targetRotation }, { easing: 'quadOut' })
                    )
                    .call(() => {
                        tween(tile.node)
                            .to(0.125, { worldPosition: targetPosition }, { easing: 'quadOut' })
                            .call(resolve)
                            .start();
                    })
                    .start();
            });

            cumulativeHeight += 0.2;
        }
    }

    private static getRotationForDirection(direction: string): Quat {
        const targetRotation = new Quat();
        switch (direction) {
            case 'up':
                Quat.fromEuler(targetRotation, 0, 180, 0);
                break;
            case 'down':
                Quat.fromEuler(targetRotation, 0, -180, 0);
                break;
            case 'left':
                Quat.fromEuler(targetRotation, 0, 0, -180);
                break;
            case 'right':
                Quat.fromEuler(targetRotation, 0, 0, 180);
                break;
            default:
                Quat.fromEuler(targetRotation, 0, 0, 0); // varsayılan rotasyon
        }
        return targetRotation;
    }

    static async animateTilesToZeroScale(tiles: Tile[]): Promise<void> {
        const reversedTiles = [...tiles].reverse();

        for (const tile of reversedTiles) {
            await new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.2, { scale: new Vec3(0, 0, 0) })
                    .call(resolve)
                    .start();
            });
        }
    }
}
