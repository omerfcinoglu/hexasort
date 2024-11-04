import { _decorator, Component } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GameManager } from '../managers/GameManager';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    public Place(placingGroundTile : GroundTile, selectedCluster : TileCluster){
        if(selectedCluster.placement()){
            
        }    
    }
}
