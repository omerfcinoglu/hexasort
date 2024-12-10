import { _decorator, Node, Vec3 } from 'cc';
import { GroundTile, GroundTileStates } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    /**
     * Transfers a TileCluster from the source GroundTile to the target GroundTile.
     * Handles animation, locking, and merging logic.
     * @param source The GroundTile from which the cluster is transferred.
     * @param targetGround The GroundTile to which the cluster is transferred.
     */
    async transferClusterToTarget(source: GroundTile, targetGround: GroundTile): Promise<void> {
        if (!source || !targetGround) return;

        const cluster = source.getLastCluster();
        if (!cluster) return;

        try {
            targetGround.tryLock();
            await TileAnimator.animateClusterTransfer(cluster, targetGround, source);
            
            const targetTopCluster = targetGround.getLastCluster();
            if (targetTopCluster) {
                const transferTiles = cluster.getTiles();
                await targetTopCluster.transferTiles(transferTiles);
                targetTopCluster.attachedGround = targetGround;
            }

            source.state = GroundTileStates.Ready
            source.popTileCluster();

        } catch (error) {
            console.error('Error during cluster transfer:', error);
        } finally {
            source.unlock();
            targetGround.unlock();
        }
    }
}
