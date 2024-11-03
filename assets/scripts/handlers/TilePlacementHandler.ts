import { _decorator, Component } from 'cc';
import { TileSelectionHandler } from './TileSelectionHandler';
import { CollisionHandler } from '../handlers/CollisionHandler';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    public Place(selectedCluster : TileCluster){
        selectedCluster.placement();
    }
}
