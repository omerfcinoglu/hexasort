import { _decorator, Component, tween, Vec3,  MeshRenderer , Node, Collider,  ITriggerEvent } from 'cc';
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
        this.setupCollisionListener();
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
    setupCollisionListener() {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
        }
    }

    private onTriggerEnter(event: ITriggerEvent) {
        const otherNode = event.otherCollider.node;
        if (otherNode.getComponent('GroundTile')) {
            console.log('Tile triggered with a GroundTile');
        }
    }
}
