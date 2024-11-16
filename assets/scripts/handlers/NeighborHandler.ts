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

        const transferedGrounds: GroundTile[] = [];
        const typeMatches = await this.neighborChecker?.findAllMatches(currentGround) || [];

        if (typeMatches.length > 0) {
            const transfers = this.determineTransferTargets(currentGround, typeMatches);
            const { source, target } = transfers

            console.log(
                `Transferring from (${source.gridPosition.row}, ${source.gridPosition.col}) to (${target.gridPosition.row}, ${target.gridPosition.col})`
            );

            transferedGrounds.push(target);
            await this.transferHandler?.transferClusterToTarget(source, target);

            // Transfer sonrası kaynak (source) tekrar kontrol edilsin
            await this.processNeighbors(source);
            
        }

        return transferedGrounds;
    }

    private determineTransferTargets(currentGround: GroundTile, matches: GroundTile[]): { source: GroundTile, target: GroundTile } {

        if (matches.length > 1) {
            for (const match of matches) {
                return { source: match, target: currentGround };
            }
        }
        else {
            const ground1 = currentGround;
            const ground2 = matches[0]
            const clusterCount1 = ground1.attachedClusters.length;
            const clusterCount2 = ground2.attachedClusters.length;

            if (clusterCount1 === 1 && clusterCount2 > 1) return { source: ground2, target: ground1 };
            if (clusterCount2 === 1 && clusterCount1 > 1) return { source: ground1, target: ground2 };

            if (clusterCount1 < clusterCount2) return { source: ground2, target: ground1 };
            if (clusterCount2 < clusterCount1) return { source: ground1, target: ground2 };

            return { source: ground2, target: ground1 };
        }

    }
}
