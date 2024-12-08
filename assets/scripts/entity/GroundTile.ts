import { _decorator, Component, Node, Collider, Color, Vec3, MeshRenderer, Mesh } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';
import { ColorProvider } from '../core/ColorProvider';
import { LockableComponent } from '../helpers/LockableComponent';
import { TileConfig } from '../core/TileConfig';
import { TileAnimator } from '../helpers/TileAnimator';
import { TilePlacementHandler } from '../handlers/TilePlacementHandler';

const { ccclass, property } = _decorator;

/**
 * !TODO
 * 
 * Ground Tile'ın içinde transfer olan tilelar kontrol edilip burada pozisyon verilemeli.
 * Bu tile animatorü groundtile'da çağırmayı sağlar
 * 
 */

@ccclass('GroundTile')
export class GroundTile extends LockableComponent {

    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedClusters: TileCluster[] = [];
    private mesh : MeshRenderer;

    public isPlacedGround: boolean = false;
    
    private defaultColor: Color = null;
    private highlightColor: Color = null;

    private comboCounter = 0;

    get Combo() {
        return this.comboCounter
    }
    
    onLoad() {
        this.mesh = this.node.getComponentInChildren(MeshRenderer);
        this.highlightColor = ColorProvider.getInstance().getColor(7);
        this.defaultColor = ColorProvider.getInstance().getColor(6);
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

    public placeSelectableTile(selectableTile: SelectableTiles, targetGround: GroundTile) {
        for (const tileCluster of selectableTile.tileClusters) {
            this.addTileCluster(tileCluster);
            tileCluster.place(this);
        }
        selectableTile.node.removeFromParent();
    }

    public popTileCluster() {
        const lastCluster = this.attachedClusters.pop();
        if (this.attachedClusters.length === 0) {
            this.isPlacedGround = false;
            this.unlock();
            this.setActiveCollider(true);
        }
        else{

        }
    }

    public highlight(flag: boolean) {
        flag
            ? ColorProvider.ChangeAlbedoColor(this.highlightColor, this.mesh)
            : ColorProvider.ChangeAlbedoColor(this.defaultColor, this.mesh);
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
