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
            // if (!ground.tryLock()) {
            //     console.warn(`GroundTile (${ground.gridPosition.row}, ${ground.gridPosition.col}) is already locked. Skipping.`);
            //     continue;
            // }

            try {
                const lastCluster = ground.getLastCluster();
                if (lastCluster) {
                    if (!ground.tryLock()) {
                        // console.warn(`TileCluster on GroundTile (${ground.gridPosition.row}, ${ground.gridPosition.col}) is already locked. Skipping.`);
                        continue;
                    }

                    try {
                        if (lastCluster.getLength() >= this.matchStackCount) {
                            // console.log(`Clearing stack on GroundTile (${ground.gridPosition.row}, ${ground.gridPosition.col}).`);
                            ground.lock();
                            await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                            ground.popTileCluster();
                            if (!processedGrounds.includes(ground)) {
                                processedGrounds.push(ground);
                            }
                        }
                    } finally {
                        ground.unlock();
                    }
                }
            } finally {
                ground.unlock();
            }
        }
        return processedGrounds;
    }
}
