import { _decorator, Component, Camera, geometry, input, Input, EventTouch, PhysicsSystem, Vec3,  } from 'cc';
import { Tile } from '../entity/Tile';
const { ccclass, property } = _decorator;

@ccclass("InputManager")
export class InputManager extends Component {

    @property(Camera)
    readonly cameraCom!: Camera;

    private _ray: geometry.Ray = new geometry.Ray();
    private selectedTile: Tile | null = null;
    private touchOffset: Vec3 = new Vec3(); // Dokunma ve seçili Tile arasındaki mesafeyi sakla
    private isDraggable: boolean = false; // Sürükleme izni için bir bayrak
    private holdTimer: number | null = null; // Basılı tutma süresi için zamanlayıcı

    private readonly holdDuration = 0.05; // 0.3 saniyelik basılı tutma süresi

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
                    this.isDraggable = false; // Sürüklenme iznini başta kapat
                    this.holdTimer = setTimeout(() => {
                        this.isDraggable = true; // 0.3 saniye sonra sürükleme izni aç
                        this.selectedTile!.select();
                    }, this.holdDuration * 1000); // ms cinsinden

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
        if (!this.selectedTile || !this.isDraggable) return;

        const touchLocation = event.getLocation();
        this.cameraCom.screenPointToRay(touchLocation.x, touchLocation.y, this._ray);

        const touchWorldPos = new Vec3();
        if (PhysicsSystem.instance.raycast(this._ray)) {
            const result = PhysicsSystem.instance.raycastResults[0];
            touchWorldPos.set(
                this._ray.o.x + this._ray.d.x * result.distance,
                this._ray.o.y + this._ray.d.y * result.distance,
                this._ray.o.z + this._ray.d.z * result.distance
            );

            const targetPos = touchWorldPos.add(this.touchOffset);
            this.selectedTile.node.setWorldPosition(targetPos);
        }
    }

    onTouchEnd(event: EventTouch) {
        if (this.holdTimer) {
            clearTimeout(this.holdTimer); // Zamanlayıcıyı sıfırla
            this.holdTimer = null;
        }

        if (this.selectedTile) {
            if (this.isDraggable) {
                this.selectedTile.deselect(); // Sürüklemeyi bırak
            }
            this.selectedTile = null;
            this.isDraggable = false;
        }
    }
}
