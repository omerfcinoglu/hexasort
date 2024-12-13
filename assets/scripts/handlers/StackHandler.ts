import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';

const { ccclass } = _decorator;

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
        const processedGrounds: GroundTile[] = [];

        for (const ground of grounds) {
            if (!ground.tryLock()) {
                console.log(`Ground (${ground.gridPosition.row}, ${ground.gridPosition.col}) is locked`);
                continue;
            }

            try {
                const isProcessed = await this.processSingleStack(ground);
                if (isProcessed) {
                    processedGrounds.push(ground);
                }
            } finally {
                ground.unlock();
            }
        }

        return processedGrounds;
    }

    /**
     * Process a single stack for a ground tile.
     * @param ground The GroundTile to process.
     * @returns Whether the ground was processed.
     */
    public async processSingleStack(ground: GroundTile): Promise<boolean> {
        try {
            const lastCluster = ground.getLastCluster();
            if (lastCluster && lastCluster.getLength() >= this.minStackCount) {
                await this.clearStack(ground, lastCluster);
                return true; // Mark as processed
            }
        } catch (error) {
            console.error('Error processing stack:', error);
        }
        return false; // Not processed
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
