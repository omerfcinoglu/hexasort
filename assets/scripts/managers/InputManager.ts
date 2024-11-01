import { _decorator, Component, Camera, geometry, input, Input, EventTouch, PhysicsSystem, Vec3 } from 'cc';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass("InputManager")
export class InputManager extends Component {

    @property(Camera)
    readonly cameraCom!: Camera;

    private _ray: geometry.Ray = new geometry.Ray();
    private selectedTile: Tile | null = null;
    private touchOffset: Vec3 = new Vec3(); // Dokunma ve seçili Tile arasındaki mesafeyi sakla

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        const touchLocation = event.getLocation();
        this.cameraCom.screenPointToRay(touchLocation.x, touchLocation.y, this._ray);

        if (PhysicsSystem.instance.raycast(this._ray)) {
            const raycastResults = PhysicsSystem.instance.raycastResults;

            for (const result of raycastResults) {
                const hitNode = result.collider.node;
                const tile = hitNode.getComponent(Tile);
                if (tile && tile.isSelectable) {
                    this.selectedTile = tile;
                    this.selectedTile.select(); // Tile'ı seç ve sürüklemeye başla

                    // Dokunma pozisyonuyla Tile arasındaki ofseti hesapla
                    const tileWorldPos = tile.node.getWorldPosition();
                    const touchWorldPos = this._ray.o.clone().add(this._ray.d.clone().multiplyScalar(result.distance));
                    this.touchOffset = tileWorldPos.subtract(touchWorldPos);

                    break;
                }
            }
        }
    }

    onTouchMove(event: EventTouch) {
        if (!this.selectedTile) return;

        // Dokunma pozisyonunu güncelle ve world space'e dönüştür
        const touchLocation = event.getLocation();
        this.cameraCom.screenPointToRay(touchLocation.x, touchLocation.y, this._ray);

        const touchWorldPos = new Vec3();
        if (PhysicsSystem.instance.raycast(this._ray)) {
            const result = PhysicsSystem.instance.raycastResults[0];
            touchWorldPos.set(this._ray.o.x + this._ray.d.x * result.distance,
                              this._ray.o.y + this._ray.d.y * result.distance,
                              this._ray.o.z + this._ray.d.z * result.distance);

            // Tile'ın pozisyonunu, dokunma pozisyonuna göre güncelle
            const targetPos = touchWorldPos.add(this.touchOffset);
            this.selectedTile.node.setWorldPosition(targetPos);
        }
    }

    onTouchEnd(event: EventTouch) {
        if (this.selectedTile) {
            this.selectedTile.deselect(); // Sürüklemeyi bırak ve başlangıç konumuna dön
            this.selectedTile = null;
        }
    }
}