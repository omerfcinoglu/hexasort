import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween, random } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { SelectableTiles } from '../entity/SelectableTiles';

const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends Component {

    @property(Prefab)
    selectableTilesPrefab: Prefab = null!; 
    @property(Prefab)
    tileClusterPrefab: Prefab = null!;
    @property(Node)
    public selectableArea: Node = null!;

    @property
    tilesCount: number = 3; 

    private selectableTiles: SelectableTiles[] = [];

    async init() {
        await this.createSelectableTiles();
    }

    async createSelectableTiles() {
        const startX = -(this.tilesCount - 1); 
        const startXOffset = 15
        for (let i = 0; i < this.tilesCount; i++) {
            const selectableTileNode = instantiate(this.selectableTilesPrefab);
            selectableTileNode.parent = this.selectableArea;

            const position = new Vec3(startX + i * 2, 0, 0);
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
        let clusterCount = Math.floor(Math.random() * 3) + 1;
        if(clusterCount === 1) clusterCount = 2;
        const availableTypes = [1, 2, 3, 4, 5]; 
        let lastClusterTileCount = 1;
    
        for (let i = 0; i < clusterCount; i++) {
            const randomIndex = Math.floor(Math.random() * availableTypes.length);
            const tileType = availableTypes.splice(randomIndex, 1)[0];
            const tileCount = Math.floor(Math.random() * 3) + 1;
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;
    
            const cluster = tileClusterNode.getComponent(TileCluster);
            if (cluster) {
                cluster.initCluster(tileType, tileCount);
                selectableTile.tileClusters.push(cluster);
                cluster.node.setPosition(0, (lastClusterTileCount * 0.1), -0.01 * i);
            }
    
            console.log(`TileType ${tileType}\nTileCount ${tileCount}`);
            lastClusterTileCount += tileCount;
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
