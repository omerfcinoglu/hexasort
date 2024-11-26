import { _decorator, Component, UITransform, Vec2, Node, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {
    @property([Node])
    public uiElements: Node[] = []; // Canvas üzerindeki yeniden pozisyonlanacak nesneler

    @property
    public padding: Vec2 = new Vec2(10, 10); // UI elemanları için kenar boşlukları

    private canvasTransform: UITransform | null = null;

    onLoad() {
        this.canvasTransform = this.node.getComponent(UITransform);
        if (!this.canvasTransform) {
            console.error('UITransform component is missing on Canvas node.');
            return;
        }
        this.updateUIPositions();
        view.on('resize', this.updateUIPositions, this);
    }

    onDestroy() {
        view.off('resize', this.updateUIPositions, this);
    }

    private updateUIPositions() {
        if (!this.canvasTransform) return;

        const canvasWidth = this.canvasTransform.width;
        const canvasHeight = this.canvasTransform.height;

        this.uiElements.forEach((element) => {
            const uiTransform = element.getComponent(UITransform);
            if (!uiTransform) return;

            // Örnek Pozisyonlama: Sol üst, sağ alt gibi
            if (element.name === 'TopLeft') {
                element.setPosition(
                    -canvasWidth / 2 + uiTransform.width / 2 + this.padding.x,
                    canvasHeight / 2 - uiTransform.height / 2 - this.padding.y
                );
            } else if (element.name === 'TopRight') {
                element.setPosition(
                    canvasWidth / 2 - uiTransform.width / 2 - this.padding.x,
                    canvasHeight / 2 - uiTransform.height / 2 - this.padding.y
                );
            } else if (element.name === 'BottomLeft') {
                element.setPosition(
                    -canvasWidth / 2 + uiTransform.width / 2 + this.padding.x,
                    -canvasHeight / 2 + uiTransform.height / 2 + this.padding.y
                );
            } else if (element.name === 'BottomRight') {
                element.setPosition(
                    canvasWidth / 2 - uiTransform.width / 2 - this.padding.x,
                    -canvasHeight / 2 + uiTransform.height / 2 + this.padding.y
                );
            }
        });
    }
}
