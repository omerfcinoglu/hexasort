import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { GridManager } from '../managers/GridManager';

const { ccclass } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker {
    private evenColmDirections = [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 },
        { dRow: 1, dCol: -1 },
        { dRow: 1, dCol: 1 }
    ];

    private oddColmDirections = [
        { dRow: -1, dCol: 0 },
        { dRow: 1, dCol: 0 },
        { dRow: 0, dCol: -1 },
        { dRow: 0, dCol: 1 },
        { dRow: -1, dCol: -1 },
        { dRow: -1, dCol: 1 }
    ];

    public async findNeighbors(placedGround: GroundTile): Promise<GroundTile[]> {
        const neighborGrounds: GroundTile[] = [];
        const { row, col } = placedGround.gridPosition;

        const directions = col % 2 === 0 ? this.evenColmDirections : this.oddColmDirections;

        for (const { dRow, dCol } of directions) {
            const neighborRow = row + dRow;
            const neighborCol = col + dCol;

            const neighborGround = GridManager.getInstance().getGroundTile(neighborRow, neighborCol);

            if (neighborGround && !neighborGround.isLocked && neighborGround.getLastCluster()) {
                neighborGrounds.push(neighborGround);
            }
        }
        return neighborGrounds;
    }

    public async findAllMatches(placedGround: GroundTile): Promise<GroundTile[]> {
        const lastCluster = placedGround.getLastCluster();
        if (!lastCluster) return [];

        const neighbors = await this.findNeighbors(placedGround);
        const matchingNeighbors: GroundTile[] = [];

        for (const neighbor of neighbors) {
            if (neighbor.getLastCluster()?.type === lastCluster.type) {
                matchingNeighbors.push(neighbor);
            }
        }
        return matchingNeighbors;
    }
}
