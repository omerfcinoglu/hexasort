import { _decorator, Component, Node, Collider, Color, Vec3, Quat } from 'cc';
import { TileCluster } from '../core/TileCluster';
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

    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }

    public place(tileCluster: TileCluster) {
        this.lastAttachedCluster = tileCluster;
        tileCluster.node.setParent(this.node.parent);
        this.attachedClusters.push(tileCluster);
        this.setActiveCollider(false);
    }

    async transferTiles(cluster: TileCluster) {
        console.log("ABDSS");
        
        this.lastAttachedCluster.transferTiles(cluster.getTiles());
        const isMatch = await this.lastAttachedCluster.isMatch();
        if(isMatch){
            this.attachedClusters = [];
            this.setActiveCollider(true);
        }
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
    

    public checkChildTypes(): Promise<void> {
        return new Promise((resolve) => {
            if (this.attachedClusters.length > 1) {
                const topCluster = this.attachedClusters[this.attachedClusters.length - 2];
                if (this.lastAttachedCluster.type === topCluster.type) {
                    // Animasyon işlemini başlatın
                    // this.playMatchAnimation().then(() => resolve());
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
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
