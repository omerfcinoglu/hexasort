import { _decorator, Component, Node, Vec3, EventTouch, tween } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';

const { ccclass, property } = _decorator;

@ccclass('SelectableTiles')
export class SelectableTiles extends Component {

    public tileClusters: TileCluster[] = []; // Bu SelectableTiles üzerindeki tüm TileCluster'ları saklar

    public isSelected: boolean = false; // Seçili olup olmadığını takip eder

    public isSelectable : boolean = true;
    public isDragging: boolean = false;
    private touchOffset: Vec3 = new Vec3();
    public originalPosition: Vec3 = new Vec3();
    public attachedGround: GroundTile | null = null;

    protected onLoad(): void {
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
    placeAllClustersOnGround(targetGround: GroundTile) {
        for (const cluster of this.tileClusters) {
            targetGround.addTileCluster(cluster);
            cluster.node.setWorldPosition(targetGround.node.getWorldPosition());
        }
        this.tileClusters = []; 
    }
}
