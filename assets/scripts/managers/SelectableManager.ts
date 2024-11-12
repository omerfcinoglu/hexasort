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
    tileClusterPrefab: Prefab = null!; // TileCluster prefab'ına erişim
    @property(Node)
    public selectableArea: Node = null!;

    @property
    tilesCount: number = 3; // Kaç tane SelectableTiles nesnesi oluşturulacak

    private selectableTiles: SelectableTiles[] = [];

    init() {
        this.createSelectableTiles();
    }

    createSelectableTiles() {
        const startX = -((this.tilesCount - 1) * 1.5); // İlk nesnenin X pozisyonu
        const startXOffset = 10
        for (let i = 0; i < this.tilesCount; i++) {
            const selectableTileNode = instantiate(this.selectableTilesPrefab);
            selectableTileNode.parent = this.selectableArea;

            // Yanyana dizmek için her bir nesneyi X ekseninde konumlandırıyoruz
            const position = new Vec3(startX + i * 3, 0, 0); // X ekseninde her nesneyi 3 birim aralıkla yerleştir
            selectableTileNode.setPosition(position);
            
            const selectableTile = selectableTileNode.getComponent(SelectableTiles);
            if (selectableTile) {
                const pos = selectableTileNode.getWorldPosition().clone();
                selectableTile.originalPosition = pos;
                selectableTileNode.setPosition(selectableTileNode.getPosition().clone().add3f(startXOffset,0,0))
                this.addRandomClusters(selectableTile);
                this.selectableTiles.push(selectableTile);

                tween(selectableTileNode)
                .to(0.3 , {position :position})
                .start()
            }
        }
    }

    // Her SelectableTile nesnesine rastgele TileCluster'lar ekler
    addRandomClusters(selectableTile: SelectableTiles) {
        const clusterCount =  1; // 0-3 arasında rastgele cluster sayısı

        for (let i = 0; i < clusterCount; i++) {
            const tileType =  Math.floor(Math.random() * 4) + 1; // 1-4 arasında rastgele tile tipi
            const tileCount = Math.floor(Math.random() * 4) + 2; // 1-4 arasında rastgele tile sayısı
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;

            const cluster = tileClusterNode.getComponent(TileCluster);
            if (cluster) {
                cluster.initCluster(tileType, tileCount);
                selectableTile.tileClusters.push(cluster);
            }
        }
    }

    remove(selected: SelectableTiles) {
        const index = this.selectableTiles.indexOf(selected);
        if (index !== -1) {
            this.selectableTiles.splice(index, 1); // Remove the selected tile from the array
            selected.node.destroy(); // Optionally, destroy the node to clean up
        }

        if(this.selectableTiles.length === 0){
            this.createSelectableTiles();
        }
    }
}
