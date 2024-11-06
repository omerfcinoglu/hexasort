// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3, ICollisionEvent, MeshRenderer, Color } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedCluster: TileCluster[] = [];

    private defaultColor : Color = null;
    private highlightColor: Color = null;


    onLoad() {
        this.highlightColor = ColorProvider.getInstance().getColor(7)
        this.defaultColor = ColorProvider.getInstance().getColor(6) 
        this.highlight(false);
    }

    public setActiveCollider(value : boolean) {
        this.node.getComponent(Collider).enabled = value;        
    }


    public addTileCluster(tileCluster: TileCluster) {
        this.attachedCluster.push(tileCluster);
        this.setActiveCollider(false);
    }

    public highlight(flag : boolean){
        flag 
        ? ColorProvider.ChangeColor(this.highlightColor , this.node)
        : ColorProvider.ChangeColor(this.defaultColor , this.node);
    }
}
