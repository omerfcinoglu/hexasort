import { _decorator, Component, MeshRenderer, Node } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
import { ITile } from '../interfaces/ITile';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component implements ITile {

    @property
    public type: number = 0;
    private mesh : MeshRenderer;

    private m_hexagon : Node = null;
    private m_colorProvider: ColorProvider;
    
    init(type:number){
        this.type = type;
        this.m_colorProvider = ColorProvider.getInstance();
        this.m_hexagon = this.node.getChildByName("Hexagon")
        
        this.m_colorProvider.ChangeDiffuseColor(
            this.type,
            this.m_hexagon.getComponent(MeshRenderer)
        )
    }
}

