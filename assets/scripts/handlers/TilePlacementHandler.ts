// TilePlacementHandler.ts
import { _decorator, Component, Vec3 } from "cc";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "../managers/SelectableManager";

const { ccclass, property } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler extends Component {
    /**
     * Places the selected SelectableTiles on the target ground tile.
     * @param selectedTile The selected SelectableTiles instance to be placed.
     * @returns A promise resolving to true if placement is successful, otherwise false.
     */
    async place(selectedTile: SelectableTiles , selectableManager : SelectableManager): Promise<boolean> {
        const targetGround = selectedTile.attachedGround;
        if (!targetGround || !selectedTile) return false;

        // Calculate cumulative height based on existing clusters on the ground tile
        const cumulativeHeight = targetGround.getAllTileCount() * 0.2;
        console.log(targetGround.getAllTileCount());
        

        // Remove the selected tile from its parent and attach it to the target ground tile’s parent node
        selectedTile.node.removeFromParent();
        selectedTile.node.setParent(targetGround.node.parent);

        // Position the selected tile on top of the ground tile
        selectedTile.node.setPosition(
            targetGround.node.position.x,
            cumulativeHeight + 0.2,
            targetGround.node.position.z
        );

        targetGround.placeSelectableTile(selectedTile, targetGround);

        selectedTile.attachedGround = targetGround;

        selectableManager.remove(selectedTile);
        return true;
    }
}
