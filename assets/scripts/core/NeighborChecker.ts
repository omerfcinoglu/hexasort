// NeighborChecker.ts
import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableTiles } from '../entity/SelectableTiles';
import { TileCluster } from './TileCluster';
import { GridManager } from '../managers/GridManager';

const { ccclass, property } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker {

    private directions = [
        { dRow: -1, dCol: 0 },   // top
        { dRow: 1, dCol: 0 },    // bottom
        { dRow: 0, dCol: -1 },   // left
        { dRow: 0, dCol: 1 },    // right
        // { dRow: -1, dCol: -1 },  // top-left diagonal
        // { dRow: -1, dCol: 1 },   // top-right diagonal
        { dRow: 1, dCol: -1 },   // bottom-left diagonal
        { dRow: 1, dCol: 1 }     // bottom-right diagonal
    ];
    /**
     * Finds neighboring GroundTiles surrounding a given GroundTile within a grid.
     * @param grid The 2D array of GroundTiles representing the game grid.
     * @param groundTile The GroundTile for which neighbors are being identified.
     * @returns An array of neighboring GroundTiles.
     */
    public findNeighbors( groundTile: GroundTile): GroundTile[] {
        // const grid = GridManager.get
        const neighbors: GroundTile[] = [];
        const { row, col } = groundTile.gridPosition;

        for (const { dRow, dCol } of this.directions) {
            const neighborRow = row + dRow;
            const neighborCol = col + dCol;
            // gridden doğru bir şekilde row ve colm'ları al.

            const neighbor = null;
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Finds all neighboring GroundTiles that have the same type as the last TileCluster of the target SelectableTiles.
     * @param ground The SelectableTiles whose last TileCluster's type is used for matching.
     * @returns An array of neighboring GroundTiles with matching cluster types.
     */
    public findAllMatches(ground: GroundTile): GroundTile[] {
        // Get the last cluster from the target tile for type matching
        const lastCluster = ground.lastAttachedCluster;
        if (!lastCluster) return []; // Return empty if no last cluster exists

        const neighbors = this.findNeighbors(ground);
        const matchingNeighbors: GroundTile[] = [];

        // Check each neighboring GroundTile for a matching lastAttachedCluster type
        for (const neighbor of neighbors) {
            if (neighbor.lastAttachedCluster?.type === lastCluster.type) {
                matchingNeighbors.push(neighbor);
            }
        }

        return matchingNeighbors;
    }
}

