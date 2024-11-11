import { _decorator, Node, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        const preGround = cluster.attachedGround;
        if(preGround) {
            preGround.removeTileCluster(cluster)
            cluster.setActiveCollider(false);
        };
        
        await TileAnimator.animateClusterTransfer(cluster, targetGround);
        await targetGround.lastAttachedCluster.transferTiles(cluster.getTiles());


        // await targetGround.transferTiles(cluster);
        cluster.isSelectable = false; 


    }
}
