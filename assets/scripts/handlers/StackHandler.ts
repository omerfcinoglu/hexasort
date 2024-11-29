import { _decorator, getWorldTransformUntilRoot } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
import { ScoreManager } from '../managers/ScoreManager';

const { ccclass } = _decorator;

@ccclass('StackHandler')
export class StackHandler {
    private minStackCount = 0;

    constructor(minStackCount = 5) {
        this.minStackCount = minStackCount;
    }

    async processStacks(grounds: GroundTile[]): Promise<GroundTile[]> {
        const processedGrounds: GroundTile[] = [];
        for (const ground of grounds) {
            if (!ground.tryLock()) continue;
            try {
                const lastCluster = ground.getLastCluster();
                if (lastCluster) {
                    const lastClusterLength = lastCluster.getLength();
                    if (lastClusterLength >= this.minStackCount) {

                        //! calculate score'a combo bilgisi göndermeliyiz.
                        const combo = ground.Combo;
                        const score = ScoreManager.getInstance().calculateScore(combo,lastClusterLength, this.minStackCount);
                        ScoreManager.getInstance().addScore(score);
                        ground.popTileCluster();
                        await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                        processedGrounds.push(ground);
                    }
                }
            } finally {
                ground.resetCombo();
                ground.unlock();
            }
        }
        return processedGrounds;
    }
    
}
