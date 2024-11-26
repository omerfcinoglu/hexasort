import { _decorator, Component, Canvas, Camera, view, UITransform, screen } from 'cc';
import { DeivceDetector, DeviceType, Orientation } from '../helpers/DeviceDetector';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Camera)
    public mainCamera: Camera = null!;

    @property(Canvas)
    public canvas: Canvas = null!;

    private currentDeviceType: DeviceType = DeviceType.Desktop;
    private currentOrientation: Orientation = Orientation.Landscape;

    onLoad() {
        this.updateLayout();
        view.on('resize', this.updateLayout, this);
    }

    onDestroy() {
        view.off('resize', this.updateLayout, this);
    }

    private updateLayout() {
        const deviceType = DeivceDetector.getDeviceType();
        const orientation = DeivceDetector.getOrientation();
        const screenSize = screen.windowSize;
        const aspectRatio = screenSize.width / screenSize.height;

        // Konsola ekran ve canvas boyutlarını yazdır
        console.log(`Device Screen Width: ${screenSize.width}, Device Screen Height: ${screenSize.height}`);
        this.logCanvasSize();

        if (deviceType !== this.currentDeviceType || orientation !== this.currentOrientation) {
            this.currentDeviceType = deviceType;
            this.currentOrientation = orientation;

            this.updateCamera(aspectRatio, deviceType, orientation);
            this.updateCanvas(screenSize.width, screenSize.height);
        }
    }

    private updateCamera(aspectRatio: number, deviceType: DeviceType, orientation: Orientation) {
        if (!this.mainCamera) return;

        const baseHeight = 10;
        if (deviceType === DeviceType.Mobile && orientation === Orientation.Portrait) {
            this.mainCamera.orthoHeight = baseHeight / aspectRatio;
        } else if (deviceType === DeviceType.Tablet || deviceType === DeviceType.Mobile) {
            this.mainCamera.orthoHeight = baseHeight;
        } else {
            this.mainCamera.orthoHeight = baseHeight * 1.5;
        }
    }

    private updateCanvas(screenWidth: number, screenHeight: number) {
        if (!this.canvas) return;

        const uiTransform = this.canvas.node.getComponent(UITransform);
        if (!uiTransform) return;

        uiTransform.width = screenWidth;
        uiTransform.height = screenHeight;

        this.logCanvasSize(); // Canvas boyutlarını yazdır
    }

    private logCanvasSize() {
        const uiTransform = this.canvas.node.getComponent(UITransform);
        if (uiTransform) {
            console.log(`Canvas Width: ${uiTransform.width}, Canvas Height: ${uiTransform.height}`);
        } else {
            console.warn('UITransform component not found on Canvas.');
        }
    }
}
