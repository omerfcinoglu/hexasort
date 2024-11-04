// GroundTile.ts

import { _decorator, Component, Node, Collider, RigidBody, BoxCollider, Vec3, ICollisionEvent, MeshRenderer, Color } from 'cc';
import { TileCluster } from '../core/TileCluster';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('GroundTile')
export class GroundTile extends Component {
    public gridPosition: { row: number; col: number } = { row: 0, col: 0 };
    public attachedTiles: Node[] = [];


    onLoad() {
        this.changeBodyColor(ColorProvider.getInstance().getColor(6))
    }

    public setActiveCollider(value : boolean) {
        this.node.getComponent(Collider).enabled = value;        
    }

    public addChildTileCluster(tileClusterNode: Node) {
        const tileCount = this.attachedTiles.length + 1;
        const tileHeight = tileCount * 0.2;

        this.attachedTiles.push(tileClusterNode);
        tileClusterNode.parent = this.node;
        tileClusterNode.setPosition(0, tileHeight, 0);
        this.setActiveCollider(false);
    }

    public removeChildTileCluster(tileClusterNode: Node) {
        const index = this.attachedTiles.indexOf(tileClusterNode);
        if (index > -1) {
            this.attachedTiles.splice(index, 1);
        }
        tileClusterNode.removeFromParent();
    }

    public addTileCluster(tileCluster: TileCluster) {
        //!!! todo adchildtilecluster ile aynı sil bunu
        this.attachedTiles.push(tileCluster.node);
        this.setActiveCollider(false);
    }

    public changeBodyColor(newColor: Color) {
        const body = this.node.getChildByName('Body');
        if (body) {
            const meshRenderer = body.getComponent(MeshRenderer);
            if (meshRenderer) {
                const material = meshRenderer.material;
                if (material) {
                    material.setProperty('albedo', newColor);
                } else {
                    console.error('Material not found on the body mesh renderer.');
                }
            } else {
                console.error('MeshRenderer not found on the body node.');
            }
        } else {
            console.error('Body node not found.');
        }
    }

    public highlight(flag : boolean){
        const highlightColor = ColorProvider.getInstance().getColor(7)
        const defaultColor = ColorProvider.getInstance().getColor(6) 
        flag ? this.changeBodyColor(highlightColor) : this.changeBodyColor(defaultColor); 
    }
}
