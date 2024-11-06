import { _decorator, Component } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    public async place(selectedCluster: TileCluster, targetGroundTile: GroundTile): Promise<boolean> {
        return new Promise((resolve) => {
            if (selectedCluster.placement()) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}
