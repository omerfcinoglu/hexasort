import { _decorator, Component, Node, Collider, Color, Vec3 } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';
import { ColorProvider } from '../core/ColorProvider';

const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {

    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedClusters: TileCluster[] = [];
    public lastAttachedCluster: TileCluster = null;

    private defaultColor: Color = null;
    private highlightColor: Color = null;

    onLoad() {
        this.highlightColor = ColorProvider.getInstance().getColor(7);
        this.defaultColor = ColorProvider.getInstance().getColor(6);
        this.highlight(false);
    }

    addTileCluster(tileCluster: TileCluster) {
        this.attachedClusters.push(tileCluster);

        // Update lastAttachedCluster with the newly added cluster
        this.lastAttachedCluster = tileCluster;

        const currentWorldPos = tileCluster.node.worldPosition.clone();
        tileCluster.node.parent = this.node.parent;
        tileCluster.node.setWorldPosition(new Vec3(
            this.node.position.x,
            currentWorldPos.y,
            this.node.position.z
        ));
    }

    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }


    public placeSelectableTile(selectableTile: SelectableTiles, targetGround: GroundTile) {
        for (const tileCluster of selectableTile.tileClusters) {
            this.addTileCluster(tileCluster);
            tileCluster.place(this);
        }
        this.lastAttachedCluster = selectableTile.getLastCluster();
        selectableTile.node.removeFromParent();
    }

    public removeTileCluster(tileCluster: TileCluster) {
        const index = this.attachedClusters.indexOf(tileCluster);
        if (index !== -1) {
            this.attachedClusters.splice(index, 1);
        }

        // Update lastAttachedCluster or reset if no clusters remain
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
}
