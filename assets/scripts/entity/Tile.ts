import { _decorator, Component, MeshRenderer, Color } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property
    public type: number = 0;

    private color : Color = null;

    init(type){
        this.type = type;
        this.color = ColorProvider.getInstance().getColor(this.type);
        ColorProvider.ChangeColor(this.color , this.node);
    }
}
