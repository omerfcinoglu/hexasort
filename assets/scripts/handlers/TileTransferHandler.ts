import { _decorator, Node, Vec3 } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(source: GroundTile, targetGround: GroundTile): Promise<void> {
        if (!source || !targetGround) return;

        const cluster = source.getLastCluster();
        if (!cluster) return;

        if (!cluster.tryLock()) {
            console.warn('Cluster is already locked. Skipping transfer.');
            return;
        }

        try {
            if (targetGround) {
                await TileAnimator.animateClusterTransfer(cluster, targetGround);
                const targetTopCluster = targetGround.getLastCluster();
                const transferTiles = [...cluster.getTiles()].reverse();
                if(targetTopCluster){
                    await targetTopCluster.transferTiles(transferTiles);
                }
                // console.log(`Transferring cluster from (${source.gridPosition.row}, ${source.gridPosition.col}) to (${targetGround.gridPosition.row}, ${targetGround.gridPosition.col}) `);
            } else {
                console.warn('No lastAttachedCluster found on targetGround. Skipping transferTiles.');
            }
            source.popTileCluster();
        } finally {
            cluster.unlock();
        }
    }
}
