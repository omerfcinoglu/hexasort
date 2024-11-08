import { _decorator, Node, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        cluster.isSelectable = false; 
        await TileAnimator.animateClusterTransfer(cluster, targetGround);
        //! todo bir önceki ground boşaldıysa onu tekrar yerleştirebilir hale getirmeliyiz.
        targetGround.addTileCluster(cluster);
    }
}
