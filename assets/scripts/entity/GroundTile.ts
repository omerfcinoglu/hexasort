import { _decorator, Collider, Color, Vec3, MeshRenderer, Mesh, EmptyDevice } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
import { LockableComponent } from '../helpers/LockableComponent';
import { TileConfig } from '../core/TileConfig';
import { TileAnimator } from '../helpers/TileAnimator';
import { Colors } from '../../data/Colors';

const { ccclass, property } = _decorator;


@ccclass('GroundTile')
export class GroundTile extends LockableComponent {

    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedClusters: TileCluster[] = [];
    
    public isPlacedGround: boolean = false;
    
    private mesh : MeshRenderer;
    private defaultColor: Colors = null;
    private highlightColor: Colors = null;
    private comboCounter = 0;
    private m_colorProvider : ColorProvider;

    get Combo() {
        return this.comboCounter
    }


    onLoad() {
        this.mesh = this.node.getComponentInChildren(MeshRenderer);
        this.m_colorProvider = ColorProvider.getInstance();
        this.highlightColor = Colors.highlightGround
        this.defaultColor = Colors.ground
        this.highlight(false);

    }

    addTileCluster(tileCluster: TileCluster) {
        this.attachedClusters.push(tileCluster);
        const currentWorldPos = tileCluster.node.worldPosition.clone();
        tileCluster.node.parent = this.node.parent;
        tileCluster.node.setWorldPosition(new Vec3(
            this.node.position.x,
            this.getAllTileCount() * TileConfig.spacingY,
            this.node.position.z
        ));
        tileCluster.node.setPosition(currentWorldPos);
    }

    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }

    public getLastCluster(): TileCluster | null {
        if (this.attachedClusters.length === 0) return null;
        return this.attachedClusters[this.attachedClusters.length - 1];
    }

    public placeSelectableTile() {
        this.setActiveCollider(false);
        this.isPlacedGround = true;
        this.highlight(false);
    }

    public popTileCluster() {
        const lastCluster = this.attachedClusters.pop();
        if (this.attachedClusters.length === 0) {
            this.isPlacedGround = false;
            this.setActiveCollider(true);
        }
    }

    public highlight(flag: boolean) {
        flag
            ? this.m_colorProvider.ChangeAlbedoColor(this.highlightColor, this.mesh)
            : this.m_colorProvider.ChangeAlbedoColor(this.defaultColor, this.mesh);
    }

    getAllTileCount(): number {
        return this.attachedClusters.reduce((count, cluster) => count + cluster.getTiles().length, 0);
    }


    clearAllTiles(twenDuration : number){
        this.attachedClusters.forEach((cluster)=>{
            TileAnimator.animateTilesToZeroScale(cluster.getTiles(),twenDuration);
        })
    }

    addCombo(){
        this.comboCounter ++;
    }

    resetCombo(){
        this.comboCounter = 0;
    }


}
