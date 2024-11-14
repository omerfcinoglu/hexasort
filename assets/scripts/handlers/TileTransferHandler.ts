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

            const sourcePos = source.node.worldPosition;
            const targetPos = targetGround.node.worldPosition;

            // 2. Kaynak tile'ı hedefe doğru bakacak şekilde döndür
            const direction = new Vec3(targetPos.x - sourcePos.x, 0, targetPos.z - sourcePos.z).normalize();
            const lookAtRotation = Quat.fromViewUp(new Quat(), direction, Vec3.UP);
            source.node.setRotation(lookAtRotation);

            source.isProcessing = true;
            targetGround.isProcessing = true;            
            const cluster = source.getLastCluster();
            // cluster.setActiveCollider(false);
            if (targetGround) {
                await TileAnimator.animateClusterTransfer(cluster, targetGround);
                const targetTopCluster = targetGround.getLastCluster();
                const transferTiles = cluster.getTiles()
                await targetTopCluster.transferTiles(transferTiles);
                await this.checkStack(targetGround)
            } else {
                console.warn('No lastAttachedCluster found on targetGround. Skipping transferTiles.');
            }
            source.popTileCluster();
            console.log("bitti");
            source.isProcessing = false;
            targetGround.isProcessing = false; 
        }
    }


    async checkStack(target:GroundTile){
        const lastCluster = target.getLastCluster();
        if(lastCluster.getLength() >= 7){
            await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles())
            target.popTileCluster();
        }
    }
}
