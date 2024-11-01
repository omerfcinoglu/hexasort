import { _decorator, Component, Camera, geometry, input, Input, EventMouse, Vec3, Node, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("InputProvider")
export class InputProvider extends Component {
    @property(Camera)
    readonly cameraCom!: Camera;

    @property(Node)
    public saphire: Node = null!; // Mouse'u takip eden saphire node'u

    private _ray: geometry.Ray = new geometry.Ray();
    public onRaycastResult: ((resultNode: Node | null) => void) | null = null;

    onLoad() {
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onMouseMove(event: EventMouse) {
        const mousePosition = event.getLocation();
        this.cameraCom.screenPointToRay(mousePosition.x, mousePosition.y, this._ray);

        const distance = 20;
        const projectedPoint = new Vec3(
            this._ray.o.x + this._ray.d.x * distance,
            this._ray.o.y + this._ray.d.y * distance,
            this._ray.o.z + this._ray.d.z * distance
        );
        this.saphire.setWorldPosition(projectedPoint);

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
