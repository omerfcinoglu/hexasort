import { _decorator, Component } from "cc";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "../managers/SelectableManager";
import { GroundTile } from "../entity/GroundTile";

const { ccclass } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler {
    async place(selectedTile: SelectableTiles, selectableManager: SelectableManager): Promise<GroundTile> {
        const targetGround = selectedTile.attachedGround;
        if (!targetGround || !selectedTile) return null;

        if (!targetGround.tryLock()) {
            console.warn('Target GroundTile is locked, cannot place.');
            return null;
        }

        try {
            this.addClustersToGround(selectedTile, targetGround);
            this.finalizePlacement(selectedTile, selectableManager);
        } finally {
            targetGround.unlock();
        }

        return targetGround;
    }

    private addClustersToGround(selectedTile: SelectableTiles, targetGround: GroundTile) {
        for (const cluster of selectedTile.tileClusters) {
            targetGround.addTileCluster(cluster);
        }
    }

    private finalizePlacement(selectedTile: SelectableTiles, selectableManager: SelectableManager) {
        const targetGround = selectedTile.attachedGround;
        targetGround.placeSelectableTile();
        selectableManager.remove(selectedTile);
    }
}
