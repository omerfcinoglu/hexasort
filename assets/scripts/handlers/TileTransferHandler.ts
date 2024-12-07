import { _decorator, Node } from 'cc';
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

        if (!source.tryLock() || !targetGround.tryLock()) {
            console.warn('Could not lock source or target GroundTile.');
            return;
        }

        try {
            // Animasyonu tetikle
            await TileAnimator.animateClusterTransfer(cluster, targetGround, source);

            // Hedef GroundTile'da mevcut bir cluster varsa, transfer edilen cluster ile birleşir
            const targetTopCluster = targetGround.getLastCluster();
            if (targetTopCluster) {
                const transferTiles = cluster.getTiles();
                await targetTopCluster.transferTiles(transferTiles);
            } else {
                // Eğer hedefte cluster yoksa, doğrudan ekle
                targetGround.addTileCluster(cluster);
            }

            // Kaynaktaki cluster'ı kaldır
            source.popTileCluster();
        } catch (error) {
            console.error('Error during cluster transfer:', error);
        } finally {
            // Kilitlerin serbest bırakılması
            source.unlock();
            targetGround.unlock();
        }
    }
}
