import { _decorator, Component, Node, Prefab, Vec3, tween, instantiate } from 'cc';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    tileClusterPrefab: Prefab = null!; // TileCluster prefab'ı

    @property(Node)
    startPoint: Node = null!; // Başlangıç noktası (isterseniz kullanabilirsiniz)

    @property
    clusterCount: number = 3; // Kaç adet TileCluster üretileceği

    private clusters: TileCluster[] = []; // TileCluster nesneleri

    onLoad() {
        this.createSelectableClusters();
    }

    createSelectableClusters() {
        const existingClusterCount = this.clusters.length;
        const clustersToCreate = this.clusterCount - existingClusterCount;
        const startX = - (this.clusterCount - 1) * 1.5; // Cluster'lar arasındaki mesafe

        for (let i = 0; i < clustersToCreate; i++) {
            const position = new Vec3(startX + (existingClusterCount + i) * 3, 0, 0); // Cluster'ların konumu
            const clusterNode = instantiate(this.tileClusterPrefab);
            clusterNode.parent = this.node;
            clusterNode.setPosition(position.clone().add3f(0, 5, 0)); // Başlangıçta yukarıda olsun

            const cluster = clusterNode.getComponent(TileCluster);
            if (cluster) {
                // Eğer initializeCluster metodu varsa, çağırabilirsiniz
                cluster.initializeCluster();
                cluster.originalPosition = position.clone();
                cluster.isSelectable = true;
                this.clusters.push(cluster);

                // Animasyonla cluster'ı yerine getir
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
