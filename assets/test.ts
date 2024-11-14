import { _decorator, Component, tween, Vec3, Collider, ITriggerEvent, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        this.setupTriggerListener();
    }

    moveRight() {
        tween(this.node)
            .to(3, { position: new Vec3(5, this.node.position.y, this.node.position.z) })
            .start();
    }

    setupTriggerListener() {
        const collider = this.node.getComponent(Collider);
        if (collider) {
            collider.on('onTriggerEnter', this.onTriggerEnter, this);
        }
    }

    private onTriggerEnter(event: ITriggerEvent) {
        console.log('Collision detected with:', event.otherCollider.node.name);
    }

    rotate() {
        tween(this.node)
            .by(2, { rotation: Quat.fromEuler(new Quat(), 0, 180, 0) }, { easing: 'linear' }) // Y ekseninde sürekli 360 derece döndürme
            .repeatForever()
            .start();
    }
}
