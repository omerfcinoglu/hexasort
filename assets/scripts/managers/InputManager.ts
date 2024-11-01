import { _decorator, Component, Node, Camera, geometry, input, Input, EventTouch, PhysicsSystem, Color, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass("InputManager")
export class InputManager extends Component {

    @property(Camera)
    readonly cameraCom!: Camera;

    private _ray: geometry.Ray = new geometry.Ray();

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(event: EventTouch) {
        const touchLocation = event.getLocation();
        this.cameraCom.screenPointToRay(touchLocation.x, touchLocation.y, this._ray);

        if (PhysicsSystem.instance.raycast(this._ray)) {
            const raycastResults = PhysicsSystem.instance.raycastResults;

            for (const result of raycastResults) {
                const hitNode = result.collider.node;
                const tile = hitNode.getComponent(Tile);
                if (tile) {
                    tile.select();
                    break;
                }
            }
        }
    }
}
