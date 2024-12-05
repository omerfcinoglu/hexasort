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

    public async processNeighbors(currentGround: GroundTile): Promise<GroundTile[]> {
        const typeMatches = await this.neighborChecker.findMatchingNeighbors(currentGround);
        console.log(typeMatches);
        
        const transferedGrounds: GroundTile[] = [];
    
        for (const match of typeMatches) {
            const { source, target } = this.determineTransferTargets(currentGround, match);
            await this.transferHandler.transferClusterToTarget(source, target);
            transferedGrounds.push(target);
        }
    
        return transferedGrounds;
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
