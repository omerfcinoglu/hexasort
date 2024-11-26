import { _decorator, Component, Node, EventTouch, Vec3, geometry, log, Quat, math } from 'cc';
import { InputProvider } from '../input/InputProvider';

const { ccclass, property } = _decorator;

@ccclass('GridRotationHandler')
export class GridRotationHandler extends Component {
    @property(InputProvider)
    public inputProvider: InputProvider | null = null;

    private lastTouchPosition: Vec3 | null = null;

    onLoad() {
        if (!this.inputProvider) {
            log('InputProvider is not assigned to GridRotationHandler.');
            return;
        }

        this.inputProvider.onTouchStart = this.handleTouchStart.bind(this);
        this.inputProvider.onTouchMove = this.handleTouchMove.bind(this);
        this.inputProvider.onTouchEnd = this.handleTouchEnd.bind(this);
    }

    private handleTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();
        const touchPos3D = new Vec3(touchPos.x, touchPos.y, 0);
        const hitNode = this.performRaycast(touchPos3D);

        if (hitNode && hitNode === this.node) {
            log(`Grid node ${hitNode.name} touched.`);
            this.lastTouchPosition = touchPos3D;
        }
    }

    private handleTouchMove(event: EventTouch) {
        if (!this.lastTouchPosition) return;

        const currentTouchPosition = new Vec3(event.getLocationX(), event.getLocationY(), 0);
        const delta = currentTouchPosition.subtract(this.lastTouchPosition);
        const rotationSpeed = 0.5; // Döndürme hızı

        const angleX = -delta.y * rotationSpeed; // Yukarı-aşağı hareket X ekseninde döner
        const angleY = delta.x * rotationSpeed; // Sağ-sol hareket Y ekseninde döner

        const currentRotation = this.node.getRotation();
        const newRotation = Quat.rotateAround(
            new Quat(),
            currentRotation,
            Vec3.UP,
            math.toRadian(angleY)
        );
        Quat.rotateAround(newRotation, newRotation, Vec3.RIGHT, math.toRadian(angleX));

        this.node.setRotation(newRotation);
        this.lastTouchPosition = currentTouchPosition;
    }

    private handleTouchEnd() {
        this.lastTouchPosition = null;
    }

    private performRaycast(screenPos: Vec3): Node | null {
        if (!this.inputProvider) {
            log("InputProvider is not available.");
            return null;
        }

        return this.inputProvider.performRaycast(screenPos);
    }
}
