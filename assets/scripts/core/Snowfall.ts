import { _decorator, Component, Graphics, math, UITransform, view, Vec2 } from 'cc';
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

        this.updateCanvasSize();
        this.node.getComponent(UITransform).setContentSize(this.width, this.height);

        // Ekran boyutu değişikliklerini dinle
        view.on('canvas-resize', this.updateCanvasSize, this);
    }

    onDestroy() {
        // Ekran boyutu değişikliklerini temizle
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

            // Eğer kar tanesi ekranın dışına çıktıysa kaldır
            if (flake.posY > this.height) {
                this.snowflakes.splice(i, 1);
            }
        }
    }

    /**
     * Ekran boyutlarını günceller.
     */
    private updateCanvasSize() {
        const visibleSize = view.getVisibleSize();
        this.width = visibleSize.width;
        this.height = visibleSize.height;

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

    constructor(canvasWidth: number, canvasHeight: number, minSize: number, maxSize: number) {
        this.width = canvasWidth;

        // Başlangıç değerlerini ayarla
        this.posX = 0;
        this.posY = math.randomRange(-50, 0);
        this.initialAngle = math.randomRange(0, 2 * Math.PI);
        this.size = math.randomRange(minSize, maxSize);

        // Spiral yarıçapını ayarla
        this.radius = Math.sqrt(math.randomRange(0, Math.pow(canvasWidth / 2, 2)));
    }

    update(time: number) {
        // X pozisyonu bir dairenin hareketini takip eder
        const w = 0.6; // Açısal hız
        const angle = w * time + this.initialAngle;
        this.posX = this.width / 2 + this.radius * Math.sin(angle);

        // Kar tanesi düşüş hızı
        this.posY += Math.pow(this.size, 0.5);
    }

    display(graphics: Graphics) {
        // Kar tanesini çiz
        graphics.circle(this.posX, this.posY, this.size);
        graphics.fill();
    }
}
