import { _decorator, Component, Vec3 } from "cc";
import { TileCluster } from "../core/TileCluster";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler extends Component {
    async place(selectedCluster: TileCluster): Promise<boolean> {
        const targetGround = selectedCluster.lastGroundTile;
        if (!targetGround || !selectedCluster) return false;

        const cumulativeHeight = targetGround.getAllTileCount() * 0.2;

        selectedCluster.node.removeFromParent();
        selectedCluster.node.setParent(targetGround.node.parent);

        selectedCluster.node.setPosition(targetGround.node.position.x, 0.2, targetGround.node.position.z);

        targetGround.addTileCluster(selectedCluster);
        selectedCluster.lastGroundTile = targetGround;

        return true;
    }
}
