// NeighborChecker.ts
import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { GridManager } from '../managers/GridManager';

const { ccclass, property } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker {

    private evenColmDirections = [
        { dRow: -1, dCol: 0 },   // top
        { dRow: 1, dCol: 0 },    // bottom
        { dRow: 0, dCol: -1 },   // left
        { dRow: 0, dCol: 1 },    // right
        { dRow: 1, dCol: -1 },   // bottom-left diagonal
        { dRow: 1, dCol: 1 }     // bottom-right diagonal
    ];

    private oddColmDirections = [
        { dRow: -1, dCol: 0 },   // top
        { dRow: 1, dCol: 0 },    // bottom
        { dRow: 0, dCol: -1 },   // left
        { dRow: 0, dCol: 1 },    // right
        { dRow: -1, dCol: -1 },  // top-left diagonal
        { dRow: -1, dCol: 1 }    // top-right diagonal
    ];

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Finds neighboring GroundTiles surrounding a given GroundTile within a grid.
     * @param groundTile The GroundTile for which neighbors are being identified.
     * @returns An array of neighboring GroundTiles.
     */
    public async findNeighbors(placedGround: GroundTile): Promise<GroundTile[]> {
        const neighborGrounds: GroundTile[] = [];
        const { row, col } = placedGround.gridPosition;

        // Select directions based on column parity
        const directions = col % 2 === 0 ? this.evenColmDirections : this.oddColmDirections;

        for (const { dRow, dCol } of directions) {
            const neighborRow = row + dRow;
            const neighborCol = col + dCol;
            
            // Access GroundTile from GridManager
            const neighborGround = GridManager.getInstance().getGroundTile(neighborRow, neighborCol);

            if (neighborGround && neighborGround.lastAttachedCluster) {
                console.log(`Found neighbor at row ${neighborRow}, col ${neighborCol}`);
                neighborGrounds.push(neighborGround);
                neighborGround.highlight(true); // Visual highlight to track on screen
                await this.sleep(500); // Delay to allow observation
            }
        }
        return neighborGrounds;
    }

    /**
     * Finds all neighboring GroundTiles that have the same type as the last TileCluster of the target GroundTile.
     * @param ground The GroundTile whose last TileCluster's type is used for matching.
     * @returns An array of neighboring GroundTiles with matching cluster types.
     */
    public async findAllMatches(placedGround: GroundTile): Promise<GroundTile[]> {
        const lastCluster = placedGround.lastAttachedCluster;
        if (!lastCluster) return []; // Return empty if no last cluster exists

        const neighbors = await this.findNeighbors(placedGround);
        const matchingNeighbors: GroundTile[] = [];

        for (const neighbor of neighbors) {
            if (neighbor.lastAttachedCluster?.type === lastCluster.type) {
                console.log(`Match found with neighbor at row ${neighbor.gridPosition.row}, col ${neighbor.gridPosition.col}`);
                matchingNeighbors.push(neighbor);
                await this.sleep(500); // Delay to allow observation
            } else {
                console.log(`No match at neighbor row ${neighbor.gridPosition.row}, col ${neighbor.gridPosition.col}`);
            }
        }
        return matchingNeighbors;
    }
}
