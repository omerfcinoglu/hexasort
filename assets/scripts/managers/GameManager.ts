import { _decorator, Component , Node } from 'cc';
import { TileSelectionHandler } from '../handlers/TileSelectionHandler';
import { TilePlacementHandler } from '../handlers/TilePlacementHandler';
import { TileCluster } from '../core/TileCluster';
import { GridManager } from './GridManager';
import { GroundTile } from '../entity/GroundTile';
const { ccclass , property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
}
