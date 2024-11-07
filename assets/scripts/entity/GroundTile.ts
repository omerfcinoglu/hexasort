// GroundTile.ts

import { _decorator, Component, Node, Collider, Color, Vec3, tween, Quat } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
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
        const lastWorldPos = tileCluster.node.getPosition().clone();
        tileCluster.node.removeFromParent();
        this.node.parent.addChild(tileCluster.node);
        tileCluster.node.setPosition(lastWorldPos);
        this.attachedCluster.push(tileCluster);
        this.setActiveCollider(false);
    }



    public attachNewCluster(tileCluster: TileCluster): Promise<void> {
        return new Promise<void>(async (resolve) => {
            let cumulativeHeight = this.getAllTileCount() * 0.2; 
            const groundWorldPos = this.node.getPosition().clone() // GroundTile'ın dünya konumu
            const tiles = tileCluster.getTiles();
            for (let i = tiles.length - 1; i >= 0; i--) {
                const tile = tiles[i];
                const targetYPosition = cumulativeHeight;
    
                await new Promise<void>((innerResolve) => {
                    const targetRotation = new Quat();
                    Quat.fromEuler(targetRotation, 0, 0, 180); // Rotasyon için Quat ayarları
    
                    tween(tile.node)
                        .parallel(
                            tween().to(2, { position: new Vec3(0, targetYPosition + 0.2, 0) }),
                            tween().to(2, { rotation: targetRotation })
                        )
                        .call(() => {
                            // Nihai hedefe gitmek için world position kullanıyoruz
                            const finalTargetPosition = new Vec3(1, targetYPosition,0);
                            tween(tile.node)
                                .to(2, { position: finalTargetPosition })
                                .call(innerResolve)
                                .start();
                        })
                        .start();
                });
    
                cumulativeHeight += 0.2;
            }
    
            resolve();
        });
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
