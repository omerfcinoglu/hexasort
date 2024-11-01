import { _decorator, Component, Node, BoxCollider, ITriggerEvent } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

@ccclass("GroundTile")
export class GroundTile extends Tile {
    
    public childrenTiles: Node[] = []; // Çocuk tile'ları tutan dizi
    private collider: BoxCollider | null = null;

    onLoad() {
        this.collider = this.getComponent(BoxCollider);
        if (this.collider) {
            this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }

        this.type = -1; // Ground tile type -1
        this.updateColor(); // Ground için rengi ayarla

        const collider = this.node.getComponent(BoxCollider) || this.node.addComponent(BoxCollider);
        collider.size.set(1.5, 0.2, 1.5); // Collider boyutunu ayarla (örneğin tile boyutuna göre)
        this.updateColliderState();
    }
    
    onDestroy() {
        if (this.collider) {
            this.collider.off('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    addChildTile(tileNode: Node) {
        this.childrenTiles.push(tileNode);
        tileNode.parent = this.node; // Ground tile’ın çocuğu yap
        tileNode.setPosition(0, 0.2, 0); // Hafif yukarıda konumlandır
        
        this.updateColliderState();
    }

    removeChildTile(tileNode: Node) {
        const index = this.childrenTiles.indexOf(tileNode);
        if (index > -1) {
            this.childrenTiles.splice(index, 1);
        }
        tileNode.parent = null; // Çocukluktan çıkar
        
        this.updateColliderState();
    }

    public updateColliderState() {
        const collider = this.node.getComponent(BoxCollider);
        if (collider) {
            collider.enabled = this.childrenTiles.length === 0; // Çocuk varsa collider kapalı
            console.log(collider.enabled);
            
        }
    }




    public hasChildTile(): boolean {
        // Eğer ground tile'ın bir çocuğu varsa collider'ı kapat
        if (this.node.children.length > 0) {
            this.collider!.enabled = false;
            return true;
        }
        this.collider!.enabled = true;
        return false;
    }

    private onCollisionEnter(event: ITriggerEvent) {
        // Eğer collider açıksa ve çarpışma varsa "ah" mesajı yazdır
        if (this.collider!.enabled) {
            const otherCollider = event.otherCollider;
            const tile = otherCollider.node.getComponent(Tile); // Çarpışan tile'ı al
            if (tile && tile.isDragging) {
                console.log("ah");
            }
        }
    }
}
