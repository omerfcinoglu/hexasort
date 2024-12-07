import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
import { ScoreInfo, ScoreManager } from '../managers/ScoreManager';

const { ccclass } = _decorator;

interface StackedGroundInfo {
    groundTile: GroundTile;
    stackedCount: number;
}

@ccclass('StackHandler')
export class StackHandler {
    private minStackCount = 0;

    constructor(minStackCount = 5) {
        this.minStackCount = minStackCount;
    }

    async processStacks(grounds: GroundTile[]): Promise<StackedGroundInfo[]> {
        const processedInfo: StackedGroundInfo[] = [];

        for (const ground of grounds) {
            if (!ground.tryLock()) continue;
            if (!ground.isPlacedGround) continue;

            try {
                const lastCluster = ground.getLastCluster();
                if (lastCluster) {
                    const lastClusterLength = lastCluster.getLength();

                    if (lastClusterLength >= this.minStackCount) {
                        // Stack'i temizle
                        await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                        ground.popTileCluster();

       
                        processedInfo.push({
                            groundTile: ground,
                            stackedCount: lastClusterLength,
                        });
                        ScoreManager.getInstance().addScore(
                            {
                                score : lastClusterLength,
                                isCombo : false
                            }
                        )
                    }
                }
            } finally {
                ground.unlock();
            }
        }

        return processedInfo;
    }
}
