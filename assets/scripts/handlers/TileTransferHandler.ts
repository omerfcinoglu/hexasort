import { _decorator } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { Tile } from '../entity/Tile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {
    async transferClusterToTarget(source: GroundTile, targetGround: GroundTile): Promise<void> {
        if (!source || !targetGround) return;

        const cluster = source.getLastCluster();
        if (!cluster) return;

        if (!source.tryLock()) return;

        try {
            if (targetGround) {
                targetGround.tryLock();

                await TileAnimator.animateClusterTransfer(cluster, targetGround, source);

                const targetTopCluster = targetGround.getLastCluster();
                const transferTiles: Tile[] = cluster.getTiles(); // Doğru tür dönüşümü

                if (targetTopCluster) {
                    // Eğer transferTiles bir TileCluster[] ise, uygun adaptasyonu burada yapın
                    await targetTopCluster.transferTiles(transferTiles); // Tile[] transferi
                }

                source.popTileCluster();
            }
        } finally {
            targetGround.unlock();
            source.unlock();
        }
    }
}
