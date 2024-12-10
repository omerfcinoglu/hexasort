import { _decorator } from 'cc';
import { NeighborChecker } from '../core/NeighborChecker';
import { TileTransferHandler } from './TileTransferHandler';
import { GroundTile, GroundTileStates } from '../entity/GroundTile';

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
        const typeMatches = await this.neighborChecker?.findAllMatches(currentGround) || [];
        
        if (typeMatches.length > 0) {
            if (typeMatches.length === 1) {
                const { source, target } = this.determineTransferTargets(currentGround, typeMatches[0]);
                await this.transferHandler?.transferClusterToTarget(source, target);     
                transferedGrounds.push(source);
                transferedGrounds.push(target);
            } else {
                for (const match of typeMatches) {
                    await this.transferHandler?.transferClusterToTarget(match, currentGround);
                    currentGround.state = GroundTileStates.ReadyForNeighbor;
                    transferedGrounds.push(match);
                    transferedGrounds.push(currentGround);
                }
            }
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