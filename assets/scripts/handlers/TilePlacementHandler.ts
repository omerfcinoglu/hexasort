// TilePlacementHandler.ts
import { _decorator, Component, Vec3 } from "cc";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "../managers/SelectableManager";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;


@ccclass("TilePlacementHandler")
export class TilePlacementHandler {
    /**
     * Places the selected SelectableTiles on the target ground tile.
     * @param selectedTile The selected SelectableTiles instance to be placed.
     * @returns A promise resolving to true if placement is successful, otherwise false.
     */
    async place(selectedTile: SelectableTiles,
        selectableManager: SelectableManager): Promise<GroundTile> {
        const targetGround = selectedTile.attachedGround;
        if (!targetGround || !selectedTile) return null;

        // selectedTile.grounded();

        for (const cluster of selectedTile.tileClusters) {
            targetGround.addTileCluster(cluster);
        }
    
        targetGround.setActiveCollider(false);
        targetGround.isPlacedGround = true;
        selectableManager.remove(selectedTile);
        return targetGround;
    }
}
