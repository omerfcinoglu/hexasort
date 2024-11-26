import { view, sys } from 'cc';

export enum DeviceType {
    Mobile,
    Tablet,
    Desktop
}

export enum Orientation {
    Portrait,
    Landscape
}

export class DeivceDetector {
    static getDeviceType(): DeviceType {
        const width = view.getCanvasSize().width;
        const height = view.getCanvasSize().height;

        if (sys.isMobile) {
            const minDimension = Math.min(width, height);
            if (minDimension <= 600) {
                return DeviceType.Mobile;
            }
            return DeviceType.Tablet;
        }

        return DeviceType.Desktop;
    }

    static getOrientation(): Orientation {
        const width = view.getCanvasSize().width;
        const height = view.getCanvasSize().height;

        return width > height ? Orientation.Landscape : Orientation.Portrait;
    }

    static getAspectRatio(): number {
        const size = view.getCanvasSize();
        return size.width / size.height;
    }
}
