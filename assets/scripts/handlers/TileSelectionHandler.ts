import { _decorator, Node, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
const { ccclass } = _decorator;

@ccclass("TileSelectionHandler")
export class TileSelectionHandler {
    private selectedTile: Tile | null = null;
    private originalPosition: Vec3 = new Vec3();

    public handleTileSelection(tile: Tile) {
        if (tile.isSelectable) {
            this.selectedTile = tile;
            this.originalPosition = tile.node.getWorldPosition().clone();
            console.log("Tile selected:", tile.node.name);
        }
    }

    public getSelectedTile(): Tile | null {
        return this.selectedTile;
    }

    public resetSelection() {
        if (this.selectedTile) {
            this.selectedTile.node.setWorldPosition(this.originalPosition);
            this.selectedTile = null;
            console.log("Selection reset");
        }
    }
}
