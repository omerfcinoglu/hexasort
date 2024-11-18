// SelectableTiles.ts
import { _decorator, Component, Vec3, tween, Node, BoxCollider } from "cc";
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

    private idleColliderSize : Vec3 = new Vec3(1.5,5,1.5);
    private selectedColliderSize : Vec3 = new Vec3(0.1,5,0.1);

    start() {
        this.setColliderSize(false);
    }

    /**
     * Changing collider size when player click 
     * @param isSelected 
     */
    setColliderSize(isSelected : boolean){
        isSelected 
        ? this.node.getComponent(BoxCollider).size = this.selectedColliderSize
        : this.node.getComponent(BoxCollider).size = this.idleColliderSize

        this.testCollider(isSelected);
    }

    enableCollider(isActive : boolean){
        this.node.getComponent(BoxCollider).enabled = isActive;
    }

    testCollider(isSelected : boolean){
        const testNode = this.node.getChildByName("Test");
        isSelected 
        ? testNode.scale = this.selectedColliderSize
        : testNode.scale = this.idleColliderSize        
    }
        

    /**
     * Selects this tile and initiates dragging by setting the touch offset.
     * @param touchWorldPos - The initial world position where the touch event began.
     */
    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) return;
        this.setColliderSize(true);
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
        this.setColliderSize(false);
        this.isDragging = false;
        this.resetPosition();
    }

    /**
     * Resets the tile to its original position with animation.
     */
    public resetPosition() {
        this.enableCollider(false);
        tween(this.node)
            .to(0.3, { worldPosition: this.originalPosition })
            .call(()=>this.enableCollider(true))
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
