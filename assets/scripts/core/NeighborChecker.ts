import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass('NeighborChecker')
export class NeighborChecker  {
    private grid;

    constructor(grid : GroundTile[][]){
        this.grid = grid;
    }

    public findNeighbors(groundTile: GroundTile): Promise<GroundTile[]> {
        console.log(groundTile);
        return
        
        return new Promise((resolve) => {
            const neighbors: GroundTile[] = [];
            const { row, col } = groundTile.gridPosition;

            // Komşu pozisyonlarını belirleyin
            const directions = [
                { dRow: -1, dCol: 0 }, // üst
                { dRow: 1, dCol: 0 },  // alt
                { dRow: 0, dCol: -1 }, // sol
                { dRow: 0, dCol: 1 }   // sağ
            ];

            for (const { dRow, dCol } of directions) {
                const neighborRow = row + dRow;
                const neighborCol = col + dCol;
                const neighbor = this.getGroundTile(neighborRow, neighborCol);

                if (neighbor) {
                    neighbors.push(neighbor);
                }
            }

            resolve(neighbors);
        });
    }

    public getGroundTile(row: number, col: number): GroundTile | null {
        if (this.grid[row] && this.grid[row][col]) {
            return this.grid[row][col];
        }
        return null;
    }

    public setGrid(grid: GroundTile[][]): void {
        this.grid = grid;
    }
}
