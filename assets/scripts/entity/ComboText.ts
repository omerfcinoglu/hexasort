import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ComboText')
export class ComboText extends Component {
    isRunning: boolean = false;

    protected onEnable(): void {
        this.animate();
    }

    private animate() {
        if (this.isRunning) return;
        this.isRunning = true;

        const opacityComponent = this.node.getComponent(UIOpacity);
        if (!opacityComponent) {
            console.error('UIOpacity component is missing on the node.');
            this.isRunning = false;
            return;
        }

        const startY = this.node.position.y;
        const targetY = startY + 150;

        opacityComponent.opacity = 0; // Start with fully transparent

        tween(opacityComponent)
            .to(0.5, { opacity: 255 }, { easing: 'quadOut' }) // Fade in
            .to(0.5, { opacity: 0 }, { easing: 'quadIn' }) // Fade out
            .start();

        tween(this.node)
            .to(1, { position: new Vec3(this.node.position.x, targetY, this.node.position.z) }, { easing: 'quadOut' })
            .call(() => {
                this.node.setPosition(
                    this.node.position.x,
                    startY,
                    this.node.position.z,
                )
                this.isRunning = false;
                this.node.active = false; // Disable the node after the animation
            })
            .start();
    }
}
