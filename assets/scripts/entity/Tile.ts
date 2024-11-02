import { _decorator, Component, tween, Vec3,  MeshRenderer , Node, Collider,  ITriggerEvent, Color, BoxCollider } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass , property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    public type: number = 1;

    public isSelectable: boolean = false;
    private originalPosition: Vec3 = new Vec3();
    public isDragging: boolean = false;
    protected body: Node = null;



    onLoad() {
        this.body = this.node.getChildByName("Body");
        this.originalPosition = this.node.getPosition().clone();
        this.updateColor();
        this.setupCollider();
    }

    select() {
        if (!this.isSelectable) return;
        this.isDragging = true;
    }

    move(delta: Vec3) {
        if (!this.isDragging) return;
        const currentPosition = this.node.getPosition();
        this.node.setPosition(currentPosition.add(delta));
    }

    deselect() {
        if (!this.isDragging) return;
        this.isDragging = false;
        tween(this.node)
            .to(0.3, { position: this.originalPosition })
            .start();
    }

    private setupCollider() {
        let collider = this.getComponent(Collider);
        if (!collider) {
            collider = this.addComponent(BoxCollider);
        }
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
                    console.error("no mat");
                }
            }
        }
    }
    
    public highlight() {
        const meshRenderer = this.body.getComponent(MeshRenderer);
        if (meshRenderer && meshRenderer.material) {
            const color = meshRenderer.material.getProperty('albedo') as Color;
            if (color) {
                const highlightedColor = new Color(
                    color.r * 1.5, 
                    color.g * 1.5, 
                    color.b * 1.5, 
                    color.a
                );
                meshRenderer.material.setProperty('albedo', highlightedColor);
            }
        }
    }


}
