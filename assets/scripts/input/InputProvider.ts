import { _decorator, Component, Camera, geometry, input, Input, EventTouch, Vec3, Node, Color, MeshRenderer, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("InputProvider")
export class InputProvider extends Component {
    @property(Camera)
    readonly cameraCom!: Camera;


    public _ray: geometry.Ray = new geometry.Ray();
    public onRaycastResult: ((resultNode: Node | null) => void) | null = null;
    public onTouchStart: ((event: EventTouch) => void) | null = null;
    public onTouchMove: ((event: EventTouch) => void) | null = null;
    public onTouchEnd: ((event: EventTouch) => void) | null = null;

    onLoad() {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMoveEvent, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStartEvent, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMoveEvent, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStartEvent, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEndEvent, this);
    }

    private onTouchMoveEvent(event: EventTouch) {
        this.performRaycast(new Vec3(event.getLocation().x, event.getLocation().y, 0));
        if (this.onTouchMove) {
            this.onTouchMove(event);
        }
    }

    private onTouchStartEvent(event: EventTouch) {
        if (this.onTouchStart) {
            this.onTouchStart(event);
        }
    }

    private onTouchEndEvent(event: EventTouch) {
        if (this.onTouchEnd) {
            this.onTouchEnd(event);
        }
    }

    private performRaycast(touchPosition: Vec3) {
        this.cameraCom.screenPointToRay(touchPosition.x, touchPosition.y, this._ray);
        let hitNode: Node | null = null;
        if (PhysicsSystem.instance.raycast(this._ray)) {
            const results = PhysicsSystem.instance.raycastResults;
            if (results.length > 0) {
                hitNode = results[0].collider.node;
            }
        }

        if (this.onRaycastResult) {
            this.onRaycastResult(hitNode);
        }
    }

}
