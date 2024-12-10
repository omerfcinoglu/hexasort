// TileCluster.ts
import { _decorator, Component, Node, Prefab, Vec3, instantiate, tween, Collider } from 'cc';
import { Tile } from '../entity/Tile';
import { GroundTile } from '../entity/GroundTile';
import { LockableComponent } from '../helpers/LockableComponent';
import { SoundManager } from '../managers/SoundManager';
import { Sounds } from './Sounds';
import { TileConfig } from './TileConfig';

const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    
    @property({ type: Prefab })
    public tilePrefab: Prefab = null!; // Prefab for creating individual tiles within the cluster

    @property
    public tileCount: number = 0; // Number of tiles in this cluster

    private tiles: Tile[] = []; // Holds all Tile instances within the cluster
    private touchOffset: Vec3 = new Vec3(); // Offset for touch-based dragging
    public type: number = null; // Type identifier for the tile cluster
    public isSelectable: boolean = true; // Determines if the cluster can be selected
    public isDragging: boolean = false; // Tracks if the cluster is being dragged
    public originalPosition: Vec3 = new Vec3(); // Initial position of the cluster
    public attachedGround: GroundTile | null = null; // Ground tile this cluster is attached to

    /**
     * Stores the initial position of the cluster on load.
     */
    onLoad() {
        this.originalPosition = this.node.getPosition().clone();
    }

    /**
     * Initializes the cluster with a specific type and number of tiles.
     * @param type - The type of the cluster.
     * @param tileCount - The number of tiles to create in this cluster.
     */
    public initCluster(type: number, tileCount: number) {
        this.type = type;
        this.createTiles(tileCount);
    }

    /**
     * Creates the specified number of tiles and arranges them within the cluster.
     * @param tileCount - Number of tiles to create.
     */
    private createTiles(tileCount: number) {
        for (let i = 0; i < tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            this.tileCount++;
            const tilePosition = new Vec3(0, (i+1) * TileConfig.spacingY, 0);
            tileNode.setPosition(tilePosition);

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.init(this.type); // Initialize each tile with the cluster type
            }
            this.tiles.push(tileComp!);
        }
    }



    /**
     * Transfers tiles from another cluster to this one, keeping their world positions.
     * @param tiles - Array of Tile instances to add.
     */
    async transferTiles(tiles: Tile[]) {
		const reversedTiles = [...tiles].reverse()
        
        const tilesToAddCount = reversedTiles.length;
        for (let i = 0; i < tilesToAddCount; i++) {
            const tile = reversedTiles.pop();
            const worldPosition = tile!.node.getWorldPosition();
            this.tileCount++;
            tile!.node.removeFromParent();
            tile!.node.setParent(this.node, true);
            tile!.node.setWorldPosition(worldPosition);
            this.tiles.push(tile!);
        }
    }

    /**
     * Enables or disables the collider component on the cluster node.
     * @param value - Boolean indicating if the collider should be active.
     */
    public setActiveCollider(value: boolean) {
        this.node.getComponent(Collider).enabled = value;
    }
    /**
     * Retrieves all tiles in this cluster.
     * @returns An array of Tile instances.
     */
    public getTiles(): Tile[] {
        return this.tiles;
    }


        /**
     * Retrieves all tiles in this cluster.
     * @returns A number of Tile count.
     */
        public getLength(): number {
            return this.tiles.length;
        }
    
    /**
     * Selects the cluster and prepares it for dragging by calculating the touch offset.
     * @param touchWorldPos - World position where the touch event occurred.
     */
    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) return;
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
    }

    /**
     * Moves the cluster to follow the touch position while dragging.
     * @param touchWorldPos - Updated world position during the drag.
     */
    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) return;
        const newPosition = touchWorldPos.add(this.touchOffset);
        newPosition.y += 0.2; // Slight adjustment for visual clarity
        this.node.setWorldPosition(newPosition);
    }

    /**
     * Deselects the cluster, stops dragging, and resets it to its original position.
     */
    public deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.resetPosition();
    }

    /**
     * Resets the cluster back to its initial position with an animation.
     */
    public resetPosition() {
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }
    
    public place(ground : GroundTile){
        this.attachedGround = ground;
    }
}
