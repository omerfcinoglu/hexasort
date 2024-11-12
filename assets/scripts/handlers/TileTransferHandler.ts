import { _decorator, Node, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        const preGround = cluster.attachedGround;
        
        if (preGround) {
            preGround.removeTileCluster(cluster);
            cluster.setActiveCollider(false);
        }

        const direction = this.calculateDirection(preGround, targetGround);

        await TileAnimator.animateClusterTransfer(cluster, targetGround, direction);

        // Null check before calling transferTiles to prevent errors
        if (targetGround.lastAttachedCluster) {
            await targetGround.lastAttachedCluster.transferTiles(cluster.getTiles());
        } else {
            console.warn('No lastAttachedCluster found on targetGround. Skipping transferTiles.');
        }
    }

    private calculateDirection(preGround: GroundTile, targetGround: GroundTile): string {
        const dx = targetGround.gridPosition.col - preGround.gridPosition.col;
        const dy = targetGround.gridPosition.row - preGround.gridPosition.row;

        if (dx === 1) return 'right';
        if (dx === -1) return 'left';
        if (dy === 1) return 'down';
        if (dy === -1) return 'up';
        return 'unknown';
    }
}
