import { _decorator, Component, MeshRenderer, Color, Mesh } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
import { ITile } from '../interfaces/ITile';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component implements ITile {

    @property
    public type: number = 0;
    private meshe : MeshRenderer;

    private m_colorProvider: ColorProvider;
    protected onLoad(): void {
        this.m_colorProvider = ColorProvider.getInstance();
    }

    init(type:number){
        this.type = type;
        this.meshe = this.node.getComponentInChildren(MeshRenderer)

        this.m_colorProvider.ChangeDiffuseColor(this.type , this.meshe)
    }
}

