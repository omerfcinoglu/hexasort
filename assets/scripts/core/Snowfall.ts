import { _decorator, Component, Graphics, math, UITransform, view, Color } from 'cc';
import { DeivceDetector } from '../helpers/DeviceDetector';

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

        // Kar tanelerini başlangıçta rastgele ekranın üstünde oluştur
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

        // Kar tanelerini güncelle ve çiz
        for (let flake of this.snowflakes) {
            flake.update(deltaTime);
            flake.display(this.graphics);

            // Kar tanesi ekranın altına düştüyse yeniden yukarıya yerleştir
            if (flake.size <= 0 || flake.posY > this.height) {
                flake.reset(this.width, this.height);
            }
        }
    }

    private updateCanvasSize() {
        const { width, height } = DeivceDetector.getCanvasSize();
        this.width = width;
        this.height = height;

        if (this.graphics) {
            this.graphics.clear();
        }

        this.node.getComponent(UITransform).setContentSize(this.width, this.height);
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

    constructor(canvasWidth: number, canvasHeight: number, minSize: number, maxSize: number, startHeight: number, startX: number) {
        this.width = canvasWidth;
        this.opacityDecreaser = math.randomRange(0.004, 0.01);
        this.isActive = false;
        this.reset(canvasWidth, canvasHeight, minSize, maxSize, startHeight, startX);
    }

    reset(canvasWidth: number, canvasHeight: number, minSize: number = 4, maxSize: number = 7, startHeight: number = 0, startX: number = 0) {
        this.posX = startX || math.randomRange(0, canvasWidth); // Rastgele bir X pozisyonu seç
        this.posY = startHeight || math.randomRange(-canvasHeight, 0); // Y üstünde rastgele bir pozisyon seç
        this.initialAngle = math.randomRange(0, 2 * Math.PI);
        this.size = math.randomRange(minSize, maxSize);
        this.radius = Math.sqrt(math.randomRange(0, Math.pow(canvasWidth / 2, 2)));
        this.opacity = 255; // Tamamen opak başlar
        this.isActive = true;
    }

    update(deltaTime: number) {
        const w = 0.6;
        const angle = w * deltaTime + this.initialAngle;
        this.posX = this.width / 2 + this.radius * Math.sin(angle);

        this.posY += Math.pow(this.size, 0.5);
        this.opacity -= this.opacityDecreaser;
        this.size -= 0.009;
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
