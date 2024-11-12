// NeighborChecker.ts
import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableTiles } from '../entity/SelectableTiles';
import { TileCluster } from './TileCluster';

const { ccclass, property } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker {

    /**
     * Finds neighboring GroundTiles surrounding a given GroundTile within a grid.
     * @param grid The 2D array of GroundTiles representing the game grid.
     * @param groundTile The GroundTile for which neighbors are being identified.
     * @returns An array of neighboring GroundTiles.
     */
    public findNeighbors(grid: GroundTile[][], groundTile: GroundTile): GroundTile[] {
        const neighbors: GroundTile[] = [];
        const { row, col } = groundTile.gridPosition;

        // Define all possible neighboring directions, including diagonals
        const directions = [
            { dRow: -1, dCol: 0 },   // top
            { dRow: 1, dCol: 0 },    // bottom
            { dRow: 0, dCol: -1 },   // left
            { dRow: 0, dCol: 1 },    // right
            { dRow: -1, dCol: -1 },  // top-left diagonal
            { dRow: -1, dCol: 1 },   // top-right diagonal
            { dRow: 1, dCol: -1 },   // bottom-left diagonal
            { dRow: 1, dCol: 1 }     // bottom-right diagonal
        ];

        // Iterate over each direction to locate valid neighboring tiles
        for (const { dRow, dCol } of directions) {
            const neighborRow = row + dRow;
            const neighborCol = col + dCol;
            const neighbor = this.getGroundTile(grid, neighborRow, neighborCol);

            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Finds all neighboring GroundTiles that have the same type as the last TileCluster of the target SelectableTiles.
     * @param grid The 2D array of GroundTiles.
     * @param targetTile The SelectableTiles whose last TileCluster's type is used for matching.
     * @returns An array of neighboring GroundTiles with matching cluster types.
     */
    public findAllMatches(grid: GroundTile[][], targetTile: SelectableTiles): GroundTile[] {
        // Get the last cluster from the target tile for type matching
        const lastCluster = targetTile.getLastCluster();
        
        if (!lastCluster) return []; // Return empty if no last cluster exists

        const neighbors = this.findNeighbors(grid, targetTile.attachedGround);
        const matchingNeighbors: GroundTile[] = [];

        // Check each neighboring GroundTile for a matching lastAttachedCluster type
        for (const neighbor of neighbors) {
            if (neighbor.lastAttachedCluster?.type === lastCluster.type) {
                matchingNeighbors.push(neighbor);
            }
        }

        return matchingNeighbors;
    }

    /**
     * Safely retrieves a GroundTile at the specified position in the grid.
     * @param grid The 2D array of GroundTiles.
     * @param row The row index of the desired GroundTile.
     * @param col The column index of the desired GroundTile.
     * @returns The GroundTile if it exists; otherwise, null.
     */
    private getGroundTile(grid: GroundTile[][], row: number, col: number): GroundTile | null {
        if (grid[row] && grid[row][col]) {
            return grid[row][col];
        }
        return null;
    }
}
