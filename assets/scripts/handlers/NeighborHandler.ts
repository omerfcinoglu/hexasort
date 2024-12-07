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
        const transferedGrounds: GroundTile[] = [];
        const typeMatches = await this.neighborChecker.findAllMatches(currentGround) || [];

        for (const match of typeMatches) {
            const { source, target } = this.determineTransferTargets(currentGround, match);
            await this.transferHandler?.transferClusterToTarget(source, target);

            if (!transferedGrounds.includes(source)) {
                transferedGrounds.push(source);
            }
            if (!transferedGrounds.includes(target)) {
                transferedGrounds.push(target);
            }
        }

        return transferedGrounds;
    }

    public async hasMatchingNeighbor(currentGround: GroundTile): Promise<boolean> {
        const neighbors = await this.getNeighbors(currentGround);
        const currentType = currentGround.getTopClusterType();

        for (const neighbor of neighbors) {
            if (neighbor.getTopClusterType() === currentType) {
                return true;
            }
        }
        return false;
    }

    public async getNeighbors(currentGround: GroundTile): Promise<GroundTile[]> {
        return this.neighborChecker.findNeighbors(currentGround);
    }

    private determineTransferTargets(currentGround: GroundTile, match: GroundTile): { source: GroundTile, target: GroundTile } {
        const clusterCount1 = currentGround.attachedClusters.length;
        const clusterCount2 = match.attachedClusters.length;

        if (clusterCount1 === 1 && clusterCount2 > 1) return { source: match, target: currentGround };
        if (clusterCount2 === 1 && clusterCount1 > 1) return { source: currentGround, target: match };

        if (clusterCount1 < clusterCount2) return { source: match, target: currentGround };
        if (clusterCount2 < clusterCount1) return { source: currentGround, target: match };

        return { source: match, target: currentGround };
    }
}
