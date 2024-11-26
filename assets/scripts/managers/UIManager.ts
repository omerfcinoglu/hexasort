import { _decorator, Component, Canvas, view, Vec3, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Canvas)
    private canvas: Canvas = null!;



    onLoad() {
    }

    onDestroy() {
    }
}
