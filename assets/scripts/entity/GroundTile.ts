import { _decorator, Component, Node, Collider, Color, Vec3, MeshRenderer, Mesh } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';
import { ColorProvider } from '../core/ColorProvider';
import { LockableComponent } from '../helpers/LockableComponent';
import { TileConfig } from '../core/TileConfig';

const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends LockableComponent {

    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedClusters: TileCluster[] = [];
    private mesh : MeshRenderer;

    public isPlacedGround: boolean = false;
    
    private defaultColor: Color = null;
    private highlightColor: Color = null;

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
            currentWorldPos.y ,
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
            this.setActiveCollider(true);
        }
    }

    public highlight(flag: boolean) {
        flag
            ? ColorProvider.ChangeColor(this.highlightColor, this.mesh)
            : ColorProvider.ChangeColor(this.defaultColor, this.mesh);
    }

    getAllTileCount(): number {
        return this.attachedClusters.reduce((count, cluster) => count + cluster.getTiles().length, 0);
    }
}
