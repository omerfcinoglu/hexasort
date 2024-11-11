import { _decorator, Component, Node, Collider, Color, Vec3, Quat, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {

    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };

    public attachedClusters: TileCluster[] = [];
    public lastAttachedCluster: TileCluster = null;

    public isSelectable : boolean = false;
    public isDragging: boolean = false;
    private touchOffset: Vec3 = new Vec3();
    public originalPosition: Vec3 = new Vec3();

    private defaultColor: Color = null;
    private highlightColor: Color = null;

    onLoad() {
        this.originalPosition = this.node.getPosition().clone();

        this.highlightColor = ColorProvider.getInstance().getColor(7);
        this.defaultColor = ColorProvider.getInstance().getColor(6);
        this.highlight(false);
    }

    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }

    public place(tileCluster: TileCluster) {
        this.lastAttachedCluster = tileCluster;
        tileCluster.node.setParent(this.node.parent);
        this.attachedClusters.push(tileCluster);
        this.setActiveCollider(false);
    }


    public removeTileCluster(tileCluster: TileCluster) {
        const index = this.attachedClusters.indexOf(tileCluster);
        if (index !== -1) {
            this.attachedClusters.splice(index, 1);
        }
    
        if (this.attachedClusters.length > 0) {
            this.lastAttachedCluster = this.attachedClusters[this.attachedClusters.length - 1];
        } else {
            this.lastAttachedCluster = null;
            this.setActiveCollider(true);
        }
    }
    

    public highlight(flag: boolean) {
        flag
            ? ColorProvider.ChangeColor(this.highlightColor, this.node)
            : ColorProvider.ChangeColor(this.defaultColor, this.node);
    }

    getAllTileCount(): number {
        return this.attachedClusters.reduce((count, cluster) => count + cluster.getTiles().length, 0);
    }
    

    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) return;
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
    }

    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) return;
        const newPosition = touchWorldPos.add(this.touchOffset);
        newPosition.y += 0.2; // Y ekseninde yukarı konumlandırma için
        this.node.setWorldPosition(newPosition);
    }

    public deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.resetPosition();
    }

    public resetPosition() {
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }
}
