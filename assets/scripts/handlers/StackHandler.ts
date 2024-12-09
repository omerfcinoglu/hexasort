import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
import { ScoreInfo, ScoreManager } from '../managers/ScoreManager';
import { TaskQueue } from '../core/TaskQueue';

const { ccclass } = _decorator;

interface StackedGroundInfo {
    groundTile: GroundTile;
    stackedCount: number;
}

@ccclass('StackHandler')
export class StackHandler {
    private minStackCount = 0;

    constructor(minStackCount:number) {
        this.minStackCount = minStackCount;
    }

    async processStacks(grounds: GroundTile[]): Promise<StackedGroundInfo[]> {
        const processedInfo: StackedGroundInfo[] = [];

        // Paralel işlemler için Promise listesi oluştur
        const stackTasks = grounds.map(async (ground) => {
            if (!ground.tryLock()) return null; // Eğer kilitlenemiyorsa işleme alma

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

                        // Skoru güncelle
                        ScoreManager.getInstance().addScore({
                            score: lastClusterLength,
                            isCombo: false,
                        });
                    }
                }
            } finally {
                ground.unlock(); // Kilidi aç
            }
        });
        await Promise.all(stackTasks);

        return processedInfo;
    }
}
