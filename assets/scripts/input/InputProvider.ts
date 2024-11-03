import { _decorator, Component, Camera, geometry, input, Input, EventTouch, Vec3, Node, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputProvider')
export class InputProvider extends Component {
    @property(Camera)
    public cameraCom: Camera | null = null;

    public onTouchStart: ((event: EventTouch) => void) | null = null;
    public onTouchMove: ((event: EventTouch) => void) | null = null;
    public onTouchEnd: ((event: EventTouch) => void) | null = null;

    private _ray: geometry.Ray = new geometry.Ray();

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.handleTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.handleTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.handleTouchEnd, this);

        if (!this.cameraCom) {
            console.error("Camera component is not assigned in InputProvider.");
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.handleTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.handleTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.handleTouchEnd, this);
    }

    private handleTouchStart(event: EventTouch) {
        this.onTouchStart?.(event);
    }

    private handleTouchMove(event: EventTouch) {
        this.onTouchMove?.(event);
    }

    private handleTouchEnd(event: EventTouch) {
        this.onTouchEnd?.(event);
    }

    public performRaycast(touchPosition: Vec3): Node | null {
        if (!this.cameraCom) {
            console.error("Camera component not assigned in InputProvider");
            return null;
        }

        this.cameraCom.screenPointToRay(touchPosition.x, touchPosition.y, this._ray);
        if (PhysicsSystem.instance.raycast(this._ray)) {
            const results = PhysicsSystem.instance.raycastResults;
            if (results.length > 0) {
                const hitNode = results[0].collider.node;
                return hitNode;
            }
        }
        return null;
    }
}
