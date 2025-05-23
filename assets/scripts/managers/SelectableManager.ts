import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween } from "cc";
import { TileCluster } from "../core/TileCluster";
import { SelectableTiles } from "../entity/SelectableTiles";
import { TileConfig } from "../core/TileConfig";
import { SoundManager } from "./SoundManager";
import { Sounds } from "../core/Sounds";
import { SingletonComponent } from "../helpers/SingletonComponent";

const { ccclass, property } = _decorator;

@ccclass("SelectableManager")
export class SelectableManager extends SingletonComponent<SelectableManager> {
    @property(Prefab)
    selectableTilesPrefab: Prefab = null!;
    @property(Prefab)
    tileClusterPrefab: Prefab = null!;
    @property(Node)
    public selectableArea: Node = null!;

    tilesCount: number = 3;
    private selectableTiles: SelectableTiles[] = [];
    private enterTheSceneDuration : number = 0.3;

    async init(startTiles: { [key: number]: { tileType: number; tileCount: number }[] }) {
        await this.createSelectableTiles(startTiles);
    }

    async createSelectableTiles(startTiles: { [key: number]: { tileType: number; tileCount: number }[] }) {
        const idlePositionOffset = -4.5
        const startX = (this.tilesCount - 1) + idlePositionOffset ;
        const startXOffset = 20;
        const gap = 3;

        for (let i = 0; i < this.tilesCount; i++) {
            const selectableTileNode = instantiate(this.selectableTilesPrefab);
            selectableTileNode.parent = this.selectableArea;

            const position = new Vec3(startX + i * gap, 0, 0);
            selectableTileNode.setPosition(position);

            const selectableTile = selectableTileNode.getComponent(SelectableTiles);
            if (selectableTile) {
                const pos = selectableTileNode.getWorldPosition().clone();
                selectableTile.originalPosition = pos;
                selectableTileNode.setPosition(selectableTileNode.getPosition().clone().add3f(startXOffset - position.x, 0, 0));

                const tileConfig = startTiles[i + 1] || [];
                if (tileConfig.length > 0) {
                    this.addCustomClusters(selectableTile, tileConfig);
                } else {
                    this.addRandomClusters(selectableTile);
                }

                this.selectableTiles.push(selectableTile);
                await this.enterTheSceneAnimation(selectableTileNode, position);
            }
        }
    }

    async addCustomClusters(selectableTile: SelectableTiles, tileConfig: { tileType: number; tileCount: number }[]) {
        let lastClusterTileCount = 0;


        for (let i = 0; i < tileConfig.length; i++) {
            const { tileType, tileCount } = tileConfig[i];
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;

            const cluster = tileClusterNode.getComponent(TileCluster);
            if (cluster) {
                cluster.initCluster(tileType, tileCount);
                selectableTile.tileClusters.push(cluster);
                cluster.node.setPosition(
                    0,
                    lastClusterTileCount * TileConfig.spacingY,
                    0
                );
            }

            lastClusterTileCount += tileCount;
        }
    }

     addRandomClusters(selectableTile: SelectableTiles) {

        let clusterCount = Math.floor(Math.random() * 3) + 1;
        if(clusterCount === 1) clusterCount = 2;
        const availableTypes = [1, 2, 3, 4, 5]; 
        let lastClusterTileCount = 0;
    
        for (let i = 0; i < clusterCount; i++) {
            const randomIndex =  Math.floor(Math.random() * availableTypes.length);
            const tileType = availableTypes.splice(randomIndex, 1)[0];
            const tileCount = Math.floor(Math.random() * 3) + 1;
            const tileClusterNode = instantiate(this.tileClusterPrefab);
            tileClusterNode.parent = selectableTile.node;
    
            const cluster = tileClusterNode.getComponent(TileCluster);

            if (cluster) {
                cluster.initCluster(tileType, tileCount);
                selectableTile.tileClusters.push(cluster);
                cluster.node.setPosition(
                    0,
                    lastClusterTileCount * TileConfig.spacingY,
                    0
                );
            }
    
            lastClusterTileCount += tileCount;
        }
    }

    remove(selected: SelectableTiles , endGame : boolean = false ) {
        const index = this.selectableTiles.indexOf(selected);
        if (index !== -1) {
            this.selectableTiles.splice(index, 1); // Remove the selected tile from the array
            selected.node.setPosition(100,100,100)
            selected.node.destroy(); // Optionally, destroy the node to clean up
        }

        if (this.selectableTiles.length === 0 && !endGame) {
            this.createSelectableTiles([]);
        }
    }

    async enterTheSceneAnimation(selectableTileNode: Node, position: Vec3): Promise<void> {
        SoundManager.getInstance().playSound(Sounds.SelectablesEntry);
        await new Promise<void>((resolve) => {
            tween(selectableTileNode)
                .to(this.enterTheSceneDuration, { position: position }, { easing: "expoInOut" })
                .call(resolve)
                .start();
        });

        await new Promise<void>((resolve) => {
            tween(selectableTileNode)
                .to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .call(resolve)
                .start();
        });
    }

    clear(){
        this.selectableTiles.forEach(sTile =>  sTile.node.active = false)
    }
}
