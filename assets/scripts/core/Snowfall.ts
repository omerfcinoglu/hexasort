import { _decorator, Component, Graphics, math, UITransform, view, Color } from 'cc';
import { DeivceDetector } from '../helpers/DeviceDetector';

const { ccclass, property } = _decorator;

@ccclass('Snowfall')
export class Snowfall extends Component {
    @property({ type: Number, tooltip: "Kar tanesi boyut aralığı (min)" })
    minSize: number = 2;

    @property({ type: Number, tooltip: "Kar tanesi boyut aralığı (max)" })
    maxSize: number = 5;

    @property({ type: Number, tooltip: "Her karede oluşturulacak kar tanesi sayısı" })
    flakeRate: number = 5;

    private snowflakes: Snowflake[] = [];
    private graphics: Graphics | null = null;

    private width: number = 0;
    private height: number = 0;

    onLoad() {
        // Graphics bileşenini al veya oluştur
        this.graphics = this.node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }

        view.on('canvas-resize', this.updateCanvasSize, this);

        this.updateCanvasSize();
        this.node.getComponent(UITransform).setContentSize(this.width, this.height);
    }

    onDestroy() {
        view.off('canvas-resize', this.updateCanvasSize, this);
    }

    update(deltaTime: number) {
        if (!this.graphics) return;

        // Her karede rastgele kar tanesi oluştur
        for (let i = 0; i < math.randomRangeInt(1, this.flakeRate); i++) {
            this.snowflakes.push(new Snowflake(this.width, this.height, this.minSize, this.maxSize));
        }

        // Ekranı temizle ve tüm kar tanelerini çiz
        this.graphics.clear();
        for (let i = this.snowflakes.length - 1; i >= 0; i--) {
            const flake = this.snowflakes[i];
            flake.update(deltaTime);
            flake.display(this.graphics);

            // Eğer kar tanesi boyutu < 0 ise yukarıya yeniden konumlandır
            if (flake.size <= 0) {
                flake.reset();
            }
        }
    }

    /**
     * Ekran boyutlarını günceller.
     */
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
    opacityDecreaser : number;
    constructor(canvasWidth: number, canvasHeight: number, minSize: number, maxSize: number) {
        this.width = canvasWidth;
        const max = 0.1
        const min = 0.001
        this.opacityDecreaser =  Math.random() * (max - min) + min;

        // Başlangıç değerlerini ayarla
        this.reset(canvasWidth, canvasHeight, minSize, maxSize);
    }

    /**
     * Kar tanesinin başlangıç pozisyonunu ve özelliklerini sıfırlar.
     */
    reset(canvasWidth = this.width, canvasHeight = 0, minSize = 4, maxSize = 7) {
        this.posX = math.randomRange(0, canvasWidth); // Ekranın herhangi bir X pozisyonu
        this.posY = math.randomRange(-50, 0); // Yukarıdan başlar
        this.initialAngle = math.randomRange(0, 2 * Math.PI);
        this.size = math.randomRange(5, 8);
        this.radius = Math.sqrt(math.randomRange(0, Math.pow(canvasWidth / 2, 2)));
        this.opacity = 255; // Tamamen opak başlar
    }

    update(deltaTime: number) {
        // X pozisyonu bir dairenin hareketini takip eder
        const w = 0.6; // Açısal hız
        const angle = w * deltaTime + this.initialAngle;
        this.posX = this.width / 2 + this.radius * Math.sin(angle);

        // Kar tanesi düşüş hızı
        this.posY += Math.pow(this.size, 0.5);

        // Opaklık ve boyutu küçült
        this.opacity -= this.opacityDecreaser; // Her karede biraz daha şeffaflaşır
        this.size -= 0.02; // Boyutu küçülür
    }

    display(graphics: Graphics) {
        // Opaklığı ayarla
        graphics.fillColor = new Color(255, 255, 255, math.clamp(this.opacity, 0, 255));

        // Kar tanesini çiz
        if (this.size > 0) {
            graphics.circle(this.posX, this.posY, this.size);
            graphics.fill();
        }
    }
}
