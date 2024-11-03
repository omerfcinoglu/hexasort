import { _decorator, Component, Color, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass("ColorProvider")
export class ColorProvider extends Component {
    private static _instance: ColorProvider | null = null;

    @property
    public color1: Color = Color.RED.clone();

    @property
    public color2: Color = Color.GREEN.clone();

    @property
    public color3: Color = Color.BLUE.clone();

    @property
    public color4: Color = Color.YELLOW.clone();

    @property
    public color5: Color = Color.CYAN.clone();

    @property
    public color6: Color = Color.MAGENTA.clone();

    @property
    public ground: Color = Color.MAGENTA.clone();
    
    @property
    public highlight: Color = Color.MAGENTA.clone();
    
    onLoad() {
        if (ColorProvider._instance === null) {
            ColorProvider._instance = this;
            // Sahneler arası geçişlerde yok olmaması için
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
        switch (type) {
            case 0: return this.color1.clone();
            case 1: return this.color2.clone();
            case 2: return this.color3.clone();
            case 3: return this.color4.clone();
            case 4: return this.color5.clone();
            case 5: return this.color6.clone();
            case 6: return this.ground.clone();
            case 7: return this.highlight.clone();
            default: return Color.WHITE.clone();
        }
    }
}
