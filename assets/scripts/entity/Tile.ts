import { _decorator, Component, tween, Vec3, EventTouch } from 'cc';
const { ccclass } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    public isSelectable: boolean = true;
    private originalPosition: Vec3 = new Vec3();
    private isDragging: boolean = false;

    onLoad() {
        // Başlangıç pozisyonunu kaydet
        this.originalPosition = this.node.getPosition().clone();
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
}
