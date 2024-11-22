import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

@ccclass('StackHandler')
export class StackHandler {
    private matchStackCount = 0;

    constructor(matchStackCount = 5) {
        this.matchStackCount = matchStackCount;
    }

    async processStacks(grounds: GroundTile[]): Promise<GroundTile[]> {
        const processedGrounds: GroundTile[] = [];
        for (const ground of grounds) {
            if (!ground.tryLock()) continue;
            try {
                const lastCluster = ground.getLastCluster();
                if (lastCluster) {
                    if (lastCluster.getLength() >= this.matchStackCount) {
                        await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                        ground.popTileCluster();
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
