import { _decorator, Component, tween, Vec3, EventTouch, Sprite, MeshRenderer , Node } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass , property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    public type: number = 1;

    public isSelectable: boolean = false;
    private originalPosition: Vec3 = new Vec3();
    public isDragging: boolean = false;
    private body: Node = null;



    onLoad() {
        this.updateColor();
        this.originalPosition = this.node.getPosition().clone();
        this.body = this.node.getChildByName("Body");
    }

    select() {
        if (!this.isSelectable) return;
        this.isDragging = true;
    }

    move(delta: Vec3) {
        if (!this.isDragging) return;

        // Pozisyonu fare hareketine göre güncelle
        const currentPosition = this.node.getPosition();
        this.node.setPosition(currentPosition.add(delta));
    }

    deselect() {
        if (!this.isDragging) return;

        // Sürükleme işlemi sona erdiğinde başlangıç pozisyonuna dön
        this.isDragging = false;
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }


    updateColor() {
        const colorProvider = ColorProvider.getInstance();
        if (colorProvider && this.body) {
            const color = colorProvider.getColor(this.type);
            const meshRenderer= this.body.getComponent(MeshRenderer) ;

            if (meshRenderer) {
                // Mevcut materyali alın ve rengini değiştirin
                const material = meshRenderer.material;
                if (material) {
                    material.setProperty('albedo', color);
                } else {
                    console.error("MeshRenderer üzerinde materyal yok.");
                }
            }
        }
    }
}
