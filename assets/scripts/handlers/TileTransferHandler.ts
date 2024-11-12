import { _decorator, Node, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        if (!cluster || !targetGround) return;
        const preGround = cluster.attachedGround;
        
        if (preGround) {
            preGround.removeTileCluster(cluster);
            cluster.setActiveCollider(false);
        }


        await TileAnimator.animateClusterTransfer(cluster, targetGround);

        // Null check before calling transferTiles to prevent errors
        if (targetGround.lastAttachedCluster) {
            await targetGround.lastAttachedCluster.transferTiles(cluster.getTiles());
        } else {
            console.warn('No lastAttachedCluster found on targetGround. Skipping transferTiles.');
        }
    }

}
