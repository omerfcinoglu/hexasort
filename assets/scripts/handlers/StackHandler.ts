import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
import { BlobOptions } from 'buffer';

const { ccclass } = _decorator;

interface StackedGroundInfo {
    groundTile: GroundTile;
    stackedCount: number;
}

@ccclass('StackHandler')
export class StackHandler {
    private minStackCount: number;

    constructor(minStackCount: number = 10) {
        this.minStackCount = minStackCount;
    }

    /**
     * Process stacks for the given grounds.
     * @param grounds List of GroundTile to process.
     * @returns List of processed GroundTile.
     */
    async processStacks(grounds: GroundTile[]): Promise<GroundTile[]> {
        const processedInfo: GroundTile[] = [];
        const stackTasks = grounds.map((ground) => this.processSingleStack(ground));
        await Promise.all(stackTasks);
        return processedInfo;
    }

    /**
     * Process a single stack for a ground tile.
     * @param ground The GroundTile to process.
     * @param processedInfo The shared list of processed GroundTile.
     */
    public async processSingleStack(ground: GroundTile): Promise<boolean> {

        try {
            const lastCluster = ground.getLastCluster();
            if (lastCluster && lastCluster.getLength() >= this.minStackCount) {
                await this.clearStack(ground, lastCluster);
            }
            return true;
        } catch (error) {
            console.error('Error processing stack:', error);
            return false;
        } finally {
            ground.unlock();
        }
    }

    /**
     * Clear the stack for a ground tile.
     * @param ground The GroundTile to clear.
     * @param cluster The cluster to clear.
     */
    private async clearStack(ground: GroundTile, cluster: any): Promise<void> {
        await TileAnimator.animateTilesToZeroScale(cluster.getTiles());
        ground.popTileCluster();
    }
}
