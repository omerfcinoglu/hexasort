// SelectableTiles.ts
import { _decorator, Component, Vec3, tween } from "cc";
import { TileCluster } from "../core/TileCluster";
import { GroundTile } from "../entity/GroundTile";

const { ccclass, property } = _decorator;

@ccclass('SelectableTiles')
export class SelectableTiles extends Component {
    
    public tileClusters: TileCluster[] = []; 
    public isSelected: boolean = false; 
    public isSelectable: boolean = true; 
    public isDragging: boolean = false; 
    private touchOffset: Vec3 = new Vec3(); 
    public originalPosition: Vec3 = new Vec3(); 
    public attachedGround: GroundTile | null = null;

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
        tween(this.node)
            .to(0.3, { worldPosition: this.originalPosition })
            .start();
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
