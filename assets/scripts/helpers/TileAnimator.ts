import { Node, Vec3, tween, Quat, EJoint2DType, easing } from 'cc';
import { Tile } from '../entity/Tile';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';

export class TileAnimator {

    static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        const tiles = cluster.getTiles();
        const baseTargetPosition = targetGround.node.worldPosition.clone();
        const tileCount = targetGround.getAllTileCount()
        console.log(tileCount);
        
        let cumulativeHeight = (tileCount + 1) * 0.2;

        for (let i = tiles.length - 1; i >= 0; i--) {
            const tile = tiles[i];
            const targetPosition = new Vec3(baseTargetPosition.x, cumulativeHeight, baseTargetPosition.z - ( -(i+1) * 0.01));
            const liftedPosition = new Vec3(tile.node.position.x, cumulativeHeight + 0.1, tile.node.position.y);
            const targetRotation = new Quat();
            Quat.fromEuler(targetRotation, 0, 0, -180);

            await new Promise<void>((resolve) => {
                tween(tile.node)
                    .parallel(
                        tween().to(0.125, { position: liftedPosition } , {easing:'cubicOut'}),   
                        tween().to(0.125, { rotation: targetRotation } , {easing:'quadOut'})
                    )
                    .call(() => {
                        tween(tile.node)
                            .to(0.125, { worldPosition: targetPosition })
                            .call(resolve)
                            .start();
                    })
                    .start();
            });

            cumulativeHeight += 0.2;
        }
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
