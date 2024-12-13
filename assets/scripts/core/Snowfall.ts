import { _decorator, Component, Graphics, math, UITransform, view, Color } from 'cc';
import { DeivceDetector } from '../helpers/DeviceDetector';
import { UIManager } from '../managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('Snowfall')
export class Snowfall extends Component {
    @property({ type: Number, tooltip: "Kar tanesi boyut aralığı (min)" })
    minSize: number = 2;

    @property({ type: Number, tooltip: "Kar tanesi boyut aralığı (max)" })
    maxSize: number = 5;

    @property({ type: Number, tooltip: "Kar tanesi sayısı" })
    totalFlakes: number = 1200;

    private snowflakes: Snowflake[] = [];
    private graphics: Graphics | null = null;

    private width: number = 0;
    private height: number = 0;

    onLoad() {
        this.graphics = this.node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }

        view.on('canvas-resize', this.updateCanvasSize, this);

        this.updateCanvasSize();
        this.node.getComponent(UITransform).setContentSize(this.width, this.height);
        for (let i = 0; i < this.totalFlakes; i++) {
            const startHeight = math.randomRange(-this.height, this.height); // Y'nin ekrandan yukarıya çıkışını hesapla
            const startX = math.randomRange(0, this.width); // Rastgele X pozisyonu
            this.snowflakes.push(new Snowflake(this.width, this.height, this.minSize, this.maxSize, startHeight, startX));
        }

    }

    onDestroy() {
        view.off('canvas-resize', this.updateCanvasSize, this);
    }

    update(deltaTime: number) {
        if (!this.graphics) return;

        this.graphics.clear();

        for (let flake of this.snowflakes) {
            flake.update(deltaTime);
            flake.display(this.graphics);

            if (flake.size <= 0 || flake.posY > this.height) {
                flake.reset(this.width, this.height);
            }
        }
    }

    private updateCanvasSize() {
        this.width = 3600;
        this.height = 1920;

        if (this.graphics) {
            this.graphics.clear();
        }

        this.node.getComponent(UITransform).setContentSize(this.width, this.height);
        this.snowflakes.forEach(flake => flake.reset(this.width,this.height));
    }
}
class Snowflake {
    posX: number;
    posY: number;
    initialAngle: number;
    size: number;
    radius: number;
    width: number;
    opacity: number;
    opacityDecreaser: number;
    isActive: boolean;
    isMovingX: boolean; // X ekseninde hareket eden snowflake
    xSpeed: number; // X eksenindeki dalga hızı
    xAmplitude: number; // X eksenindeki dalga genliği

    constructor(canvasWidth: number, canvasHeight: number, minSize: number, maxSize: number, startHeight: number, startX: number) {
        this.width = canvasWidth;
        this.opacityDecreaser = math.randomRange(0.004, 0.01);
        this.isActive = false;
        this.reset(canvasWidth, canvasHeight, minSize, maxSize, startHeight, startX);
    }

    reset(canvasWidth: number, canvasHeight: number, minSize: number = 4, maxSize: number = 7, startHeight: number = 0, startX: number = 0) {
        this.posX = math.randomRange(-canvasWidth, canvasWidth); // Rastgele bir X pozisyonu seç
        this.posY = startHeight || math.randomRange(-canvasHeight, 0); // Y üstünde rastgele bir pozisyon seç
        this.initialAngle = math.randomRange(0, 2 * Math.PI);
        this.size = math.randomRange(minSize, maxSize);
        this.radius = Math.sqrt(math.randomRange(0, Math.pow(canvasWidth / 2, 2)));
        this.opacity = 255; // Tamamen opak başlar
        this.isActive = true;

        // X ekseninde hareket için %40 olasılık
        this.isMovingX = true;
        this.xSpeed = math.randomRange(-100, 100); // Dalganın hızı
        this.xAmplitude = math.randomRange(250, 500); // Dalganın genliği
    }

    update(deltaTime: number) {
        this.posY += Math.pow(this.size, 0.5); // Y eksenindeki düşme hareketi
        this.opacity -= this.opacityDecreaser; // Opaklığın azalması
        this.size -= 0.009; // Boyutun azalması

        // X ekseninde hareket
        if (this.isMovingX) {
        }
    }

    display(graphics: Graphics) {
        if (!this.isActive) return;
        graphics.fillColor = new Color(255, 255, 255, math.clamp(this.opacity, 0, 255));

        if (this.size > 0) {
            graphics.circle(this.posX, this.posY, this.size);
            graphics.fill();
        }
    }
}

