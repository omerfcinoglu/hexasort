import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileCluster } from './TileCluster';
const { ccclass, property } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker {
    public findNeighbors(grid: GroundTile[][] , groundTile: GroundTile): GroundTile[] {
        const neighbors: GroundTile[] = [];
        const { row, col } = groundTile.gridPosition;

        const directions = [
            { dRow: -1, dCol: 0 }, // üst
            { dRow: 1, dCol: 0 },  // alt
            { dRow: 0, dCol: -1 }, // sol
            { dRow: 0, dCol: 1 }   // sağ
        ];

        for (const { dRow, dCol } of directions) {
            const neighborRow = row + dRow;
            const neighborCol = col + dCol;
            const neighbor = this.getGroundTile(grid , neighborRow, neighborCol);

            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    public findFirstMatch(grid: GroundTile[][] , targetGround: GroundTile): TileCluster | null {
        const neighbors = this.findNeighbors(grid , targetGround);
        
        for (const neighbor of neighbors) {
            if (neighbor.lastAttachedCluster?.type === targetGround.lastAttachedCluster?.type) {
                return neighbor.lastAttachedCluster;
            }
        }

        return null;
    }

    public findAllMatches(grid: GroundTile[][], targetGround: GroundTile): GroundTile[] {
        const neighbors = this.findNeighbors(grid, targetGround);
        const matchingNeighbors: GroundTile[] = [];

        for (const neighbor of neighbors) {
            if (neighbor.lastAttachedCluster?.type === targetGround.lastAttachedCluster?.type) {
                matchingNeighbors.push(neighbor);
            }
        }

        return matchingNeighbors;
    }

    private getGroundTile(grid: GroundTile[][],  row: number, col: number): GroundTile | null {
        if (grid[row] && grid[row][col]) {
            return grid[row][col];
        }
        return null;
    }
}
