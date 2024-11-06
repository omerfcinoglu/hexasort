// GroundTile.ts

import { _decorator, Component, Node, Collider, Color, Vec3 } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };

    public attachedCluster: TileCluster[] = [];
    public lastAttachedCluster : TileCluster = null;

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

    public addTileCluster(tileCluster: TileCluster) {
        this.lastAttachedCluster = tileCluster;
        this.attachedCluster.push(tileCluster);
        this.setActiveCollider(false);
    }

    public highlight(flag: boolean) {
        flag 
            ? ColorProvider.ChangeColor(this.highlightColor, this.node)
            : ColorProvider.ChangeColor(this.defaultColor, this.node);
    }

    public checkChildTypes(): Promise<void> {
        return new Promise((resolve) => {
            if (this.attachedCluster.length > 1) {
                const topCluster = this.attachedCluster[this.attachedCluster.length - 2];
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

    getAllTileCount(): number {
        return this.attachedCluster.reduce((total, cluster) => total + cluster.tileCount, 0);
    }

}
