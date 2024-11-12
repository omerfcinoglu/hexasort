// SelectableTiles.ts
import { _decorator, Component, Vec3, tween } from "cc";
import { TileCluster } from "../core/TileCluster";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass('SelectableTiles')
export class SelectableTiles extends Component {
    
    public tileClusters: TileCluster[] = []; // Holds all TileClusters on this SelectableTile
    public isSelected: boolean = false; // Tracks if this tile is currently selected
    public isSelectable: boolean = true; // Determines if the tile can be selected
    public isDragging: boolean = false; // Tracks if the tile is currently being dragged
    private touchOffset: Vec3 = new Vec3(); // Offset for touch position adjustments
    public originalPosition: Vec3 = new Vec3(); // Stores the tile's initial position
    public attachedGround: GroundTile | null = null; // Reference to the ground tile it is attached to

    /**
     * Initializes the selectable tile and stores its original position.
     */
    protected onLoad(): void {
    }

    /**
     * Selects this tile and initiates dragging by setting the touch offset.
     * @param touchWorldPos - The initial world position where the touch event began.
     */
    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) return;
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
    }

    /**
     * Moves the tile according to touch movements while it is being dragged.
     * @param touchWorldPos - Updated world position during dragging.
     */
    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) return;
        const newPosition = touchWorldPos.add(this.touchOffset);
        newPosition.y += 0.2; // Slight height adjustment for visual clarity
        this.node.setWorldPosition(newPosition);
    }

    /**
     * Deselects the tile, stops dragging, and resets its position.
     */
    public deselect() {
        this.isDragging = false;
        this.resetPosition();
    }

    /**
     * Resets the tile to its original position with animation.
     */
    public resetPosition() {
        console.log(this.originalPosition);
        
        tween(this.node)
            .to(0.3, { worldPosition: this.originalPosition })
            .start();
    }

    /**
     * Places all TileClusters contained in this SelectableTile onto a specified GroundTile.
     * @param targetGround - The GroundTile on which the clusters will be placed.
     */
    public placeAllClustersOnGround(targetGround: GroundTile) {
        for (const cluster of this.tileClusters) {
            targetGround.addTileCluster(cluster); // Adds each cluster to the target ground tile
            cluster.node.setWorldPosition(targetGround.node.getWorldPosition()); // Keeps the cluster's position relative to the ground tile
        }
        this.tileClusters = []; // Clears clusters after placing them
    }

    /**
     * Retrieves the last TileCluster in the tileClusters array, if any.
     * @returns The last TileCluster or null if none exist.
     */
    public getLastCluster(): TileCluster | null {
        if (this.tileClusters.length === 0) return null;
        return this.tileClusters[this.tileClusters.length - 1];
    }
}
