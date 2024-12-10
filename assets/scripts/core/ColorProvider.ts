import { _decorator, Component, Color, director, Node, Sprite, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("ColorProvider")
export class ColorProvider extends Component {
    private static _instance: ColorProvider | null = null;

    @property([Color])
    public colors: Color[] = [];

    onLoad() {
        if (ColorProvider._instance === null) {
            ColorProvider._instance = this;
            director.addPersistRootNode(this.node);
        } else {
            this.destroy();
            console.warn("Only one instance of ColorProvider is allowed.");
        }
    }

    public static getInstance(): ColorProvider {
        if (!ColorProvider._instance) {
            console.error("ColorProvider instance is not yet initialized.");
        }
        return ColorProvider._instance!;
    }

    public getColor(type: number): Color {
        if (type >= 0 && type < this.colors.length) {
            return this.colors[type].clone();
        } else {
            console.warn(`Invalid type ${type}. Returning default color.`);
            return Color.WHITE.clone(); 
        }
    }

    public changeColor(type: number, node: Node) {
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.color = ColorProvider.getInstance().getColor(type);
        } else {
            console.error("The node does not have a Sprite component.");
        }
    }

    public  ChangeDiffuseColor(type: number , body : MeshRenderer){
        if (body) {
            const material = body.material;
            if (material) {
                const color = this.getColor(type)
                material.setProperty('diffuseColor', color);
            } else {
                console.error('Material not found on MeshRenderer.');
            }                                           
        }
    }
    
    public  ChangeAlbedoColor(type: number , body : MeshRenderer){
        if (body) {
            const material = body.material;
            if (material) {
                const color = this.getColor(type)
                material.setProperty('albedo', color);
            } else {
                console.error('Material not found on MeshRenderer.');
            }                                           
        }
    }
}
