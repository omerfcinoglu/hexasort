// TilePlacementHandler.ts
import { _decorator, Component, Vec3 } from "cc";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "../managers/SelectableManager";
import { TileCluster } from "../core/TileCluster";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler extends Component {
    /**
     * Places the selected SelectableTiles on the target ground tile.
     * @param selectedTile The selected SelectableTiles instance to be placed.
     * @returns A promise resolving to true if placement is successful, otherwise false.
     */
    async place(selectedTile: SelectableTiles, selectableManager: SelectableManager): Promise<boolean> {
        const targetGround = selectedTile.attachedGround;
        if (!targetGround || !selectedTile) return false;

        // Calculate cumulative height based on existing clusters on the ground tile

        
        // Add each TileCluster from selectedTile to targetGround
        for (const cluster of selectedTile.tileClusters) {
            console.log(cluster.type);
            targetGround.addTileCluster(cluster);
        }


        // Update the last attached cluster to the last item in the array

        // Remove the selectedTile from the SelectableManager
        selectableManager.remove(selectedTile);
        return true;
    }
}
