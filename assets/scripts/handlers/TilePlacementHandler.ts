import { _decorator, Component } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';

const { ccclass } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    async placeTile(selectedCluster: TileCluster, targetGround: GroundTile): Promise<boolean> {
        if (targetGround && selectedCluster.placement()) {
            await targetGround.attachNewCluster(selectedCluster);
            return true;
        }
        return false;
    }
}
