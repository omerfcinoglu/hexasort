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

    /**
     * Finds neighboring GroundTiles surrounding a given GroundTile within a grid.
     * @param placedGround The GroundTile for which neighbors are being identified.
     * @returns An array of neighboring GroundTiles.
     */
    public async findNeighbors(placedGround: GroundTile): Promise<GroundTile[]> {
        const directions = placedGround.gridPosition.col % 2 === 0
            ? this.evenColmDirections
            : this.oddColmDirections;
    
        return directions
            .map(({ dRow, dCol }) => {
                const row = placedGround.gridPosition.row + dRow;
                const col = placedGround.gridPosition.col + dCol;
                return GridManager.getInstance().getGroundTile(row, col);
            })
            .filter(neighbor => neighbor && !neighbor.isLocked && neighbor.getLastCluster());
    }
    

    /**
     * Finds all neighboring GroundTiles that have the same type as the last TileCluster of the target GroundTile.
     * @param placedGround The GroundTile whose last TileCluster's type is used for matching.
     * @returns An array of neighboring GroundTiles with matching cluster types.
     */
    public async findMatchingNeighbors(placedGround: GroundTile): Promise<GroundTile[]> {
        const neighbors = await this.findNeighbors(placedGround);
        const lastCluster = placedGround.getLastCluster();
        if (!lastCluster) return [];
        const matchingNeighbors = neighbors.filter(
            neighbor => neighbor.getLastCluster()?.type === lastCluster.type
        );
    
        matchingNeighbors.forEach(neighbor => neighbor.lock());
        return matchingNeighbors;
    }
}
