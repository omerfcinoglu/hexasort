import { Node, Vec3, tween, Quat } from 'cc';
import { Tile } from '../entity/Tile';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { ScoreManager } from '../managers/ScoreManager';

export class TileAnimator {

    static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        const tiles = cluster.getTiles();
        const baseTargetPosition = targetGround.node.worldPosition.clone();
        const tileCount = targetGround.getAllTileCount();
        
        let cumulativeHeight = (tileCount + 1) * 0.2;

        for (let i = tiles.length - 1; i >= 0; i--) {
            const tile = tiles[i];
            const targetPosition = new Vec3(baseTargetPosition.x, cumulativeHeight + 0.1, baseTargetPosition.z + (i*0.02));
            const liftedPosition = new Vec3(tile.node.position.x, cumulativeHeight + 1, tile.node.position.y);
            const targetRotation = Quat.fromEuler(new Quat(), 0, 0, -180);

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

    static async animateTilesToZeroScale(tiles: Tile[]): Promise<void> {
        const reversedTiles = [...tiles].reverse();
        const lastTile = reversedTiles[reversedTiles.length-1]
    
        // Scale all tiles except the last one to (0, 0, 0)
        for (let i = 0; i < reversedTiles.length; i++) {
            const tile = reversedTiles[i];
            if(i===reversedTiles.length-1){
                break;
            }
            await new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.2, { scale: new Vec3(0, 0, 0) })
                    .call(resolve)
                    .start();
            });
        }
    
        // Scale the last tile to (0.231, 0.231, 0.231)
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.1, { scale: new Vec3(0.231, lastTile.node.scale.y * 0.5, 0.231) })
                .call(resolve)
                .start();
        });
    
        // Define two target positions for the last tile
        const position1 = new Vec3(0,  2, 2); // Replace with the desired first position
        const position2 = new Vec3(-2.5, 5.7, 2); // Replace with the desired second position
    
        // Move the last tile to the first position
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.3, { position: position1 } , {easing:"cubicOut"})
                .call(resolve)
                .start();
        });
    
        // Move the last tile to the second position
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.3, { position: position2 } , {easing:"expoIn"})
                .call(() => {
                    ScoreManager.getInstance().addScore(10);
                    resolve
                })
                .start();
        });
    }
    
}
