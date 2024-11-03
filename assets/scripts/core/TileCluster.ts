import { _decorator, Component, Node, Vec3, tween, Prefab, instantiate, Collider, RigidBody, BoxCollider } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { SelectableManager } from '../managers/SelectableManager';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass('TileCluster')
export class TileCluster extends Component {
    @property({ type: Prefab })
    public tilePrefab: Prefab = null!;

    @property
    public tileCount: number = 1;

    public isSelectable: boolean = true;
    public isDragging: boolean = false;
    public originalPosition: Vec3 = new Vec3();

    private tiles: Node[] = [];
    private colliderNode: Node | null = null;
    private touchOffset: Vec3 = new Vec3();

    public selectableManager: SelectableManager | null = null;

    onLoad() {
        this.colliderNode = this.node.getChildByName('Collider');
        if (!this.colliderNode) {
            console.error('Collider node not found in TileCluster.');
            return;
        }
        this.initializeCollider();
        this.initializeCluster();
        this.originalPosition = this.node.getPosition().clone();
    }

    private initializeCollider() {
        const collider = this.colliderNode!.getComponent(BoxCollider);
        if (!collider) {
            console.error('BoxCollider component missing on Collider node.');
            return;
        }
        collider.isTrigger = true;

        const rigidBody = this.colliderNode!.getComponent(RigidBody);
        if (rigidBody) {
            rigidBody.type = RigidBody.Type.KINEMATIC;
            rigidBody.useGravity = false;
        } else {
            console.error('Rigidbody component missing on Collider node.');
            return;
        }
    }

    public initializeCluster() {
        for (let i = 0; i < this.tileCount; i++) {
            const tileNode = instantiate(this.tilePrefab);
            tileNode.parent = this.node;
            tileNode.setPosition(new Vec3(0, i * 0.2, 0));

            const tileComp = tileNode.getComponent(Tile);
            if (tileComp) {
                tileComp.type = Math.floor(Math.random() * 6); // Adjust as needed
                tileComp.updateColor();
            }

            this.tiles.push(tileNode);
        }

        this.updateColliderSize();
    }

    private updateColliderSize() {
        const collider = this.colliderNode!.getComponent(BoxCollider);
        if (collider) {
            const width = 1; // Adjust according to your tile size
            const height = this.tileCount * 0.2; // Adjust according to tile count
            collider.size = new Vec3(width, height, width);
            collider.center = new Vec3(0, height / 2, 0);
        }
    }

    public select(touchWorldPos: Vec3) {
        if (!this.isSelectable) {
            return;
        }
        this.isDragging = true;
        this.touchOffset = this.node.getWorldPosition().subtract(touchWorldPos);
    }

    public move(touchWorldPos: Vec3) {
        if (!this.isDragging) {
            return;
        }
        const newPosition = touchWorldPos.add(this.touchOffset);
        this.node.setWorldPosition(newPosition);
    }

    public deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.resetPosition();
    }

    public async placeOnGrid(groundTile: GroundTile) {
        const targetPosition = groundTile.node.getWorldPosition();
        this.isSelectable = false;

        await new Promise<void>((resolve) => {
            tween(this.node)
                .to(0.2, { worldPosition: targetPosition })
                .call(() => {
                    resolve();
                })
                .start();
        });

        this.node.parent = groundTile.node;
        this.node.setPosition(Vec3.ZERO);

        if (this.selectableManager) {
            this.selectableManager.removeCluster(this);
        }
    }

    public resetPosition() {
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }

    public addTile(tileType: number) {
        const tileNode = instantiate(this.tilePrefab);
        tileNode.parent = this.node;
        tileNode.setPosition(new Vec3(0, this.tiles.length * 0.2, 0));

        const tileComp = tileNode.getComponent(Tile);
        if (tileComp) {
            tileComp.type = tileType;
            tileComp.updateColor();
        }

        this.tiles.push(tileNode);
        this.tileCount = this.tiles.length;
        this.updateColliderSize();
    }

    public removeTile(tileNode: Node) {
        const index = this.tiles.indexOf(tileNode);
        if (index !== -1) {
            this.tiles.splice(index, 1);
            tileNode.destroy();
            this.tileCount = this.tiles.length;
            this.updateColliderSize();
        }
    }
}
