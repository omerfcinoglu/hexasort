import { _decorator, Node, Quat, tween, Vec3 } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(source: GroundTile, targetGround: GroundTile): Promise<void> {
        if (!source || !targetGround) return;
        if (source) {
            const cluster = source.getLastCluster();
            if (targetGround) {
                await TileAnimator.animateClusterTransfer(cluster, targetGround);
                const targetTopCluster = targetGround.getLastCluster();
                const transferTiles = cluster.getTiles()
                await targetTopCluster.transferTiles(transferTiles);
            } else {
                console.warn('No lastAttachedCluster found on targetGround. Skipping transferTiles.');
            }
            source.popTileCluster();
        }
    }
}
