import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';

const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    selectableTilesPrefab: Prefab = null!; // SelectableTiles prefab'ına erişim
    @property(Prefab)
    tileClusterPrefab: Prefab = null!; // SelectableTiles prefab'ına erişim
    @property(Node)
    public selectableArea: Node = null!;

    @property
    tilesCount: number = 3; // Kaç tane SelectableTiles nesnesi oluşturulacak

    onLoad() {
        this.createSelectableTiles();
    }

    createSelectableTiles() {
        const startX = - (this.tilesCount - 1) * 1.5; // X ekseninde başlangıç pozisyonu ayarı

        for (let i = 0; i < this.tilesCount; i++) {
            // Her bir SelectableTiles için pozisyon belirle
            const position = new Vec3(startX + i * 3, 0, 0);
            const selectableTileNode = instantiate(this.selectableTilesPrefab);
            selectableTileNode.parent = this.selectableArea;
            selectableTileNode.setPosition(position.clone().add3f(10, 0, 0)); // Animasyon için başlangıç pozisyonu

            const selectableTile = selectableTileNode.getComponent(SelectableTiles);
            if (selectableTile) {
                this.addRandomClusters(selectableTile);

                // Animasyon ile hedef pozisyona taşı
                tween(selectableTileNode)
                    .to(0.5, { position: position })
                    .start();
            }
        }
    }

    // Her SelectableTile nesnesine rastgele TileCluster'lar ekler
    addRandomClusters(selectableTile: SelectableTiles) {
        const clusterCount = Math.floor(Math.random() * 4); // 0-3 arasında rastgele cluster sayısı

        for (let i = 0; i < clusterCount; i++) {
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;

            const cluster = tileClusterNode.getComponent(TileCluster);
            if (cluster) {
                const tileType = Math.floor(Math.random() * 4); // 0-3 arasında rastgele tile tipi
                const tileCount = Math.floor(Math.random() * 4); // 0-3 arasında rastgele tile sayısı
                cluster.initCluster(tileType, tileCount);

                // Yüksekliği cluster sayısına göre ayarla
                const clusterPosition = new Vec3(0, i * 1.2, 0);
                tileClusterNode.setPosition(clusterPosition);
                selectableTile.tileClusters.push(cluster);
            }
        }
    }
}
