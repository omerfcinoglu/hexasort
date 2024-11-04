import { _decorator, Component } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GameManager } from '../managers/GameManager';
import { GroundTile } from '../entity/GroundTile';
import { NeighborChecker } from '../core/NeighborChecker';
const { ccclass, property } = _decorator;

@ccclass('TilePlacementHandler')
export class TilePlacementHandler extends Component {
    private neighborChecker;

    protected onLoad(): void {
        this.neighborChecker = new NeighborChecker([]);
    }

    public Place(placingGroundTile : GroundTile, selectedCluster : TileCluster){
        if(selectedCluster.placement()){
            this.neighborChecker.findNeighbors(placingGroundTile);
        }    
    }
}
