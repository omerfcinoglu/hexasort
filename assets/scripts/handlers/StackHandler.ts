import { _decorator,  } from 'cc';
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
                        ground.popTileCluster();
                        await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                        
                        const score = ScoreManager.getInstance().calculateScore(1,lastClusterLength, this.minStackCount);
                        ScoreManager.getInstance().addScore(score);
                        
                        processedGrounds.push(ground);
                    }
                }
            } finally {
                ground.unlock();
            }
        }
        return processedGrounds;
    }
    
}
