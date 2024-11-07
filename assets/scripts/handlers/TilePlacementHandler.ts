import { _decorator, Component } from "cc";
import { TileCluster } from "../core/TileCluster";
const { ccclass, property } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler extends Component {
    async place(selectedCluster: TileCluster): Promise<boolean> {
        const targetGround = selectedCluster.lastGroundTile;
        if (!targetGround || !selectedCluster) return false;
        targetGround.addTileCluster(selectedCluster);
        selectedCluster.lastGroundTile = targetGround;
        return true;
    }
}
