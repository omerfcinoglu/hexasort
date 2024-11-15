import { _decorator } from 'cc';
import { NeighborChecker } from '../core/NeighborChecker';
import { TileTransferHandler } from './TileTransferHandler';
import { GroundTile } from '../entity/GroundTile';

const { ccclass } = _decorator;

@ccclass('NeighborHandler')
export class NeighborHandler {
    private neighborChecker: NeighborChecker | null = null;
    private transferHandler: TileTransferHandler | null = null;

    constructor() {
        this.neighborChecker = new NeighborChecker();
        this.transferHandler = new TileTransferHandler();
    }

    async processNeighbors(currentGround: GroundTile): Promise<GroundTile[]> {
        console.log(`Processing neighbors for (${currentGround.gridPosition.row}, ${currentGround.gridPosition.col})`);
        const transferedGrounds : GroundTile[] = [];
        const typeMatches = await this.neighborChecker?.findAllMatches(currentGround) || [];

        for (const match of typeMatches) {
            const { source, target } = this.determineTransferTarget(currentGround, match);

            if (source && target) {
                transferedGrounds.push(target);
                await this.transferHandler?.transferClusterToTarget(source, target);
                await this.processNeighbors(source);
            }
        }
        return transferedGrounds;
    }

    private determineTransferTarget(ground1: GroundTile, ground2: GroundTile): { source: GroundTile, target: GroundTile } {
        const clusterCount1 = ground1.attachedClusters.length;
        const clusterCount2 = ground2.attachedClusters.length;

        if (clusterCount1 === 1 && clusterCount2 > 1) return { source: ground2, target: ground1 };
        if (clusterCount2 === 1 && clusterCount1 > 1) return { source: ground1, target: ground2 };

        if (clusterCount1 < clusterCount2) return { source: ground2, target: ground1 };
        if (clusterCount2 < clusterCount1) return { source: ground1, target: ground2 };

        return { source: ground2, target: ground1 };
    }
}
