import { _decorator, Component, Node, Prefab, Vec3, tween, instantiate } from 'cc';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    tileClusterPrefab: Prefab = null!;

    @property(Node)
    public selectableArea: Node = null!;
    
    @property
    clusterCount: number = 3;

    private clusters: TileCluster[] = [];

    onLoad() {
        this.createSelectableClusters();
    }

    createSelectableClusters() {
        const existingClusterCount = this.clusters.length;
        const clustersToCreate = this.clusterCount - existingClusterCount;
        const startX = - (this.clusterCount - 1) * 1.5;

        for (let i = 0; i < clustersToCreate; i++) {
            const position = new Vec3(startX + (existingClusterCount + i) * 3, 0, 0);
            const clusterNode = instantiate(this.tileClusterPrefab);
            clusterNode.parent = this.selectableArea;
            clusterNode.setPosition(position.clone().add3f(10, 0, 0));

            const cluster = clusterNode.getComponent(TileCluster);
            if (cluster) {
                cluster.initCluster(2 , 3);
                cluster.originalPosition = position.clone();
                cluster.isSelectable = true;
                this.clusters.push(cluster);

                tween(clusterNode)
                    .to(0.5, { position: position })
                    .start();
            }
        }
    }

    removeCluster(cluster: TileCluster) {
        const index = this.clusters.indexOf(cluster);
        if (index !== -1) {
            this.clusters.splice(index, 1);
            cluster.node.destroy();
            this.checkAndRefillClusters();
        }
    }

    checkAndRefillClusters() {
        if (this.clusters.length < this.clusterCount) {
            this.createSelectableClusters();
        }
    }
}
