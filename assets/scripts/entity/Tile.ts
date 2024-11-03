import { _decorator, Component, MeshRenderer, Color } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property
    public type: number = 0;

    onLoad() {
        this.updateColor();
    }

    updateColor() {
        const colorProvider = ColorProvider.getInstance();
        if (colorProvider) {
            const color = colorProvider.getColor(this.type);
            const meshRenderer = this.getComponent(MeshRenderer);
            if (meshRenderer) {
                const material = meshRenderer.material;
                if (material) {
                    material.setProperty('albedo', color);
                } else {
                    console.error("Material not found on MeshRenderer.");
                }
            } else {
                console.error("MeshRenderer not found on Tile.");
            }
        } else {
            console.error("ColorProvider instance is not available.");
        }
    }

    public highlight() {
        const meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer && meshRenderer.material) {
            const color = meshRenderer.material.getProperty('albedo') as Color;
            if (color) {
                const highlightedColor = new Color(
                    Math.min(color.r * 1.5, 255),
                    Math.min(color.g * 1.5, 255),
                    Math.min(color.b * 1.5, 255),
                    color.a
                );
                meshRenderer.material.setProperty('albedo', highlightedColor);
            }
        }
    }
}
