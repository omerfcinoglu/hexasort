import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { TileCluster } from '../core/TileCluster';
const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    tilePrefab: Prefab = null!; // Her bir Tile için prefab

    @property(Node)
    startPoint: Node = null!;

    @property
    clusterCount: number = 3; // Kaç adet TileCluster üretileceği

    private clusters: TileCluster[] = []; // TileCluster nesneleri

    onLoad() {
        this.createClusters();
        this.startMovement(); // Oyun başladığında hareketi başlat
    }

    createClusters() {
        for (let i = 0; i < this.clusterCount; i++) {
            const initialPosition = this.startPoint.position.clone(); // Her cluster başlangıç noktasından başlasın
            const cluster = new TileCluster(this.node , this.tilePrefab, 1, initialPosition);
            this.clusters.push(cluster);
        }
    }

    async startMovement() {
        const targetX = [-2 , 0 , 2]
        const duration = 0.5; // Hareket süresi

        this.clusters.forEach( async (cluster , i ) => {
            const targetPosition = new Vec3(targetX[i], 0, 0); 
            await cluster.moveToPosition(targetPosition, duration); // Cluster hareketini bekleyin
        })
    }
}
