import { _decorator, Component, Node, Collider, Color, Vec3, Quat } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
import { TileAnimator } from '../helpers/TileAnimator';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };

    public attachedCluster: TileCluster[] = [];
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

    public addTileCluster(tileCluster: TileCluster) {
        this.lastAttachedCluster = tileCluster;
        tileCluster.node.removeFromParent();
        this.node.parent.addChild(tileCluster.node);
        this.attachedCluster.push(tileCluster);
        this.setActiveCollider(false);
    }

    public attachNewCluster(tileCluster: TileCluster): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let cumulativeHeight = this.getAllTileCount() * 0.2;
            const tiles = tileCluster.getTiles();
            const targetPositionBase = this.node.getPosition().clone();

            for (let i = tiles.length - 1; i >= 0; i--) {
                const tile = tiles[i];
                const finalPosition = new Vec3(targetPositionBase.x, cumulativeHeight, targetPositionBase.z);
                const targetRotation = new Quat();
                Quat.fromEuler(targetRotation, 0, 0, 180); 

                await TileAnimator.liftAndMoveToPosition(tile.node, 0.2, finalPosition);
                await TileAnimator.animateToPositionWithRotation(tile.node, finalPosition, targetRotation);
                
                cumulativeHeight += 0.2;
            }

            resolve();
        });
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

    public highlight(flag: boolean) {
        flag
            ? ColorProvider.ChangeColor(this.highlightColor, this.node)
            : ColorProvider.ChangeColor(this.defaultColor, this.node);
    }

    getAllTileCount(): number {
        return this.attachedCluster.reduce((total, cluster) => total + cluster.tileCount, 0);
    }
}
