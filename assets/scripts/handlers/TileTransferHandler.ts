import { _decorator, Node, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
const { ccclass } = _decorator;

@ccclass('TileTransferHandler')
export class TileTransferHandler {

    async transferClusterToTarget(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
        cluster.isSelectable = false; 
        const startPosition = cluster.node.position.clone();
        const endPosition = targetGround.node.position.clone();
        endPosition.y += targetGround.getAllTileCount() * 0.2; 

        await new Promise<void>((resolve) => {
            tween(cluster.node)
                .to(0.5, { position: endPosition })
                .call(() => {
                    targetGround.addTileCluster(cluster);
                    resolve();
                })
                .start();
        });
    }
}
