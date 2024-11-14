import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween, random } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';
import { sleep } from '../helpers/Promises';

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

    async init() {
        await this.createSelectableTiles();
    }

    async createSelectableTiles() {
        const startX = -(this.tilesCount - 1); // İlk nesnenin X pozisyonu
        const startXOffset = 10
        for (let i = 0; i < this.tilesCount; i++) {
            const selectableTileNode = instantiate(this.selectableTilesPrefab);
            selectableTileNode.parent = this.selectableArea;

            const position = new Vec3(startX + i * 2, 0, 0); // X ekseninde her nesneyi 3 birim aralıkla yerleştir
            selectableTileNode.setPosition(position);
            
            const selectableTile = selectableTileNode.getComponent(SelectableTiles);
            if (selectableTile) {
                const pos = selectableTileNode.getWorldPosition().clone();
                selectableTile.originalPosition = pos;
                selectableTileNode.setPosition(selectableTileNode.getPosition().clone().add3f(startXOffset - position.x,0,0))
                await this.addRandomClusters(selectableTile);
                this.selectableTiles.push(selectableTile);
                await this.enterTheSceneAnimation(selectableTileNode,position);
            }
        }
    }

    async addRandomClusters(selectableTile: SelectableTiles) {
        const clusterCount = 3 // Math.floor(Math.random() * 3) + 1;
        const availableTypes = [1, 2, 3, 4, 5]; // Başlangıç tipi listesi
        // console.log("Cluster count is: " + clusterCount);
        
        let lastClusterTileCount = 0;
    
        for (let i = 0; i < clusterCount; i++) {
            // Rastgele bir tip seç ve seçilen tipi `availableTypes`'dan çıkar
            const randomIndex = i+1//Math.floor(Math.random() * availableTypes.length);
            const tileType = randomIndex//availableTypes.splice(randomIndex, 1)[0];
            const tileCount = Math.floor(Math.random() * 4) + 2;
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;
    
            const cluster = tileClusterNode.getComponent(TileCluster);
            if (cluster) {
                cluster.initCluster(tileType, tileCount);
                selectableTile.tileClusters.push(cluster);
                cluster.node.setPosition(0, lastClusterTileCount * 0.3, 0);
            }
    
            // console.log(`TileType ${tileType}\nTileCount ${tileCount}`);
            // Kullanılan tip tekrar kullanılabilir hale gelmesi için availableTypes'a geri eklenir
            lastClusterTileCount += tileCount;
            // console.log(`Selectable tile clusters: ${selectableTile.tileClusters.length}`);
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

    async enterTheSceneAnimation(selectableTileNode: Node, position: Vec3): Promise<void> {
        await new Promise<void>((resolve) => {
            tween(selectableTileNode)
                .to(0.5, { position: position } , {easing:'expoInOut'})  // Move to target position
                .call(resolve)  // Resolve the promise when the position animation completes
                .start();
        });
    
        // After reaching the position, start the scale animation
        await new Promise<void>((resolve) => {
            tween(selectableTileNode)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })  // Scale up
                .to(0.1, { scale: new Vec3(1, 1, 1) })  // Scale back to normal
                .call(resolve)  // Resolve when scale animation completes
                .start();
        });
    }
}
