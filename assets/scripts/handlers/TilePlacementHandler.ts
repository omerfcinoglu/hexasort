import { _decorator } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { Tile } from '../entity/Tile';
const { ccclass } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler {
    public handleTilePlacement(tile: Tile, groundTile: GroundTile) {
        groundTile.addChildTile(tile.node);
        tile.isSelectable = false;
        console.log(`Tile placed on: ${groundTile.node.name}`);
    }
}
