import { _decorator, Component, log, screen, Size, Camera } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Responsive')
export class Responsive extends Component {
    @property(Camera)
    public mainCamera: Camera = null!;

    private prevSize: Size = new Size(0, 0);
    private designRatio: number = 16 / 9; // Tasarım oranı
    private availableHeights: number[] = [10, 12, 14, 16]; // Kullanılabilir orthoHeight değerleri

    onLoad() {
        this.prevSize = screen.windowSize.clone();
        this.checkResize();
    }

    update() {
        this.checkResize();
    }

    private checkResize() {
        const currentSize = screen.windowSize;

        if (!currentSize.equals(this.prevSize)) {
            this.prevSize.set(currentSize);
            this.updateCameraOrthoHeight();
            log("Screen resized.");
        }
    }

    private updateCameraOrthoHeight() {
        if (!this.mainCamera) {
            log("Main camera is not assigned.");
            return;
        }

        const deviceResolution = screen.windowSize;
        const deviceRatio = deviceResolution.width / deviceResolution.height;

        let targetOrthoHeight = this.availableHeights[0]; // Varsayılan minimum değeri al

        if (deviceRatio > this.designRatio) {
            const scaleFactor = deviceRatio / this.designRatio;
            targetOrthoHeight = this.getClosestHeight(this.availableHeights, scaleFactor * this.availableHeights[0]);
        } else if (deviceRatio < this.designRatio) {
            const scaleFactor = this.designRatio / deviceRatio;
            targetOrthoHeight = this.getClosestHeight(this.availableHeights, scaleFactor * this.availableHeights[0]);
        }

        this.mainCamera.orthoHeight = targetOrthoHeight;

        log(`Device Resolution: ${deviceResolution.width}x${deviceResolution.height}`);
        log(`Aspect Ratio: ${deviceRatio}`);
        log(`Adjusted OrthoHeight: ${targetOrthoHeight}`);
    }

    private getClosestHeight(heights: number[], target: number): number {
        return heights.reduce((prev, curr) => 
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    }
}
