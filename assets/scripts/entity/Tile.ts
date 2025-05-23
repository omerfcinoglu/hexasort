import { _decorator, Component, MeshRenderer, Color, Mesh } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property
    public type: number = 0;

    private color : Color = null;
    private meshes : MeshRenderer[];

    private temp_other_mesh : MeshRenderer;

    init(type){
        this.type = type;
        this.meshes = this.node.getComponentsInChildren(MeshRenderer)

        this.color = ColorProvider.getInstance().getColor(this.type);
        for (const mesh of this.meshes) {
            ColorProvider.ChangeDiffuseColor(this.color , mesh);
        }

    }
}
