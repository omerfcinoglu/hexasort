import { _decorator, Component, MeshRenderer, Color } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property
    public type: number = 0;

    private color : Color = null;
    private mesh : MeshRenderer;

    init(type){
        this.type = type;
        this.mesh = this.node.getComponentInChildren(MeshRenderer);
        this.color = ColorProvider.getInstance().getColor(this.type);
        ColorProvider.ChangeColor(this.color , this.mesh);
    }
}
