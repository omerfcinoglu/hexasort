import { view, sys } from 'cc';

export enum DeviceType {
    Mobile,
    Tablet,
    Desktop
}

enum StoreLinks {
    ANDROID = 'https://play.google.com/store/apps/details?id=com.gamebrain.hexasort&hl=en_US',
    IOS = 'https://apps.apple.com/us/app/hexa-sort/id6463127238',
}

export class DeivceDetector {
    /**
     * Cihaz türünü tespit eder.
     */
    static getDeviceType(): DeviceType {
        const width = window.visualViewport.width;
        const height = window.visualViewport.height;

        if (sys.isMobile) {
            const minDimension = Math.min(width, height);
            if (minDimension <= 600) {
                return DeviceType.Mobile;
            }
            return DeviceType.Tablet;
        }
        return DeviceType.Desktop;
    }

    /**
     * Cihazın ekran boyutlarını döndürür.
     * @returns {width, height} Ekran genişliği ve yüksekliği.
     */
    static getCanvasSize(): { width: number, height: number } {
        const visibleSize = view.getVisibleSize();
        return {
            width: visibleSize.width,
            height: visibleSize.height
        };
    }

    /**
     * Uygun mağazaya yönlendirir.
     */
    static redirectToStore(): void {
        if (sys.platform === sys.Platform.ANDROID) {
            window.location.href = StoreLinks.ANDROID;
        } else if (sys.platform === sys.Platform.IOS) {
            window.location.href = StoreLinks.IOS;
        } else {
            window.location.href = StoreLinks.ANDROID;
        }
    }
}
