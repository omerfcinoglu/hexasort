import { Node, Prefab, instantiate, Vec3, tween, RigidBody, ERigidBodyType } from 'cc';
import { Tile } from '../entity/Tile';

export enum RigidBodyGroup {
    Default = 1 << 0,
    SelectableTile = 1 << 1,
    NonSelectableTile = 1 << 2
}

export class TileCluster {
    private tiles: Node[] = [];
    public rootNode: Node;

    constructor(parent: Node, tilePrefab: Prefab, tileCount: number, initialPosition: Vec3 , isTileSelectable = false) {
        this.rootNode = new Node(); // Her TileCluster için yeni bir rootNode oluştur
        parent.addChild(this.rootNode);
        this.rootNode.setPosition(initialPosition);

        for (let i = 0; i < tileCount; i++) {
            const tileNode = this.createTile(tilePrefab, new Vec3(0, i * 0.5, 0.01 * i) , isTileSelectable);
            this.tiles.push(tileNode);
        }
    }

    createTile(tilePrefab: Prefab, localPosition: Vec3, isTileSelectable: boolean): Node {
        const tileNode = instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(Tile);
        tileComp.isSelectable = isTileSelectable;
    
        const rigidBody = tileNode.getComponent(RigidBody);
        if (rigidBody) {
            rigidBody.group = isTileSelectable ? RigidBodyGroup.SelectableTile : RigidBodyGroup.NonSelectableTile;
            rigidBody.type = ERigidBodyType.KINEMATIC;
        }
    
        tileNode.parent = this.rootNode;
        tileNode.setPosition(localPosition);
        return tileNode;
    }
    

    moveToPosition(targetPosition: Vec3, duration: number): Promise<void> {
        return new Promise((resolve) => {
            tween(this.rootNode)
                .to(duration, { position: targetPosition })
                .call(resolve)
                .start();
        });
    }

    async flipAnimation() {
        for (const tile of this.tiles) {
            await new Promise<void>((resolve) => {
                tween(tile)
                    .to(0.3, { eulerAngles: new Vec3(-180, 0, 0) }) 
                    .call(() => {
                        resolve();
                    })
                    .start();
            });
        }
    }
}
