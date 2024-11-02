import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
import { SelectableManager } from '../managers/SelectableManager';
const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    @property(Prefab)
    public tilePrefab: Prefab = null!;

    @property
    public tileCount: number = 1;

    public isSelectable: boolean = true;
    public isDragging: boolean = false;

    private tiles: Node[] = [];
    private originalPosition: Vec3 = new Vec3();
    private touchOffset: Vec3 = new Vec3();

    onLoad() {
        this.originalPosition = this.node.getPosition().clone();
        this.initializeCluster();
    }

    public initializeCluster() {
        for (let i = 0; i < this.tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.5, 0.01 * i)); 

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.isSelectable = false; // Tile'ların kendisi değil, cluster seçilebilir
                tileComp.type = Math.floor(Math.random() * 2) + 1;
                tileComp.updateColor();
            }
            this.tiles.push(tileNode);
        }
    }

    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) {
            console.log("Cluster is not selectable.");
            return;
        }
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
        console.log("Cluster selected for dragging:", this.node.name);
    }
    
    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) {
            console.log("Cluster is not being dragged.");
            return;
        }
        const newPosition = touchWorldPos.add(this.touchOffset);
        this.node.setWorldPosition(newPosition);
        console.log("Cluster moved to:", newPosition.toString());
    }
    
    public deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
    }

    public async placeOnGrid(groundTile: GroundTile) {
        // Cluster'ı grid üzerine yerleştirin
        const targetPosition = groundTile.node.getWorldPosition();
        this.isSelectable = false;

        // Animasyonla cluster'ı yerleştirin
        await new Promise<void>((resolve) => {
            tween(this.node)
                .to(0.3, { worldPosition: targetPosition })
                .call(() => {
                    resolve();
                })
                .start();
        });

        // SelectableManager'dan cluster'ı kaldırın
        const selectableManager = this.node.parent.getComponent('SelectableManager') as SelectableManager;
        if (selectableManager) {
            selectableManager.removeCluster(this);
        }
    }

    public resetPosition() {
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }
}
