import { view, sys } from 'cc';

export enum DeviceType {
    Mobile,
    Tablet,
    Desktop
}



enum StoreLinks{
    ANDROID = 'https://play.google.com/store/apps/details?id=com.gamebrain.hexasort&hl=en_US',
    IOS =  'https://apps.apple.com/us/app/hexa-sort/id6463127238',
}

export class DeivceDetector {
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


    static redirectToStore(): void {
        if (sys.platform === sys.Platform.ANDROID) {
            window.location.href = StoreLinks.ANDROID;
        } else if (sys.platform === sys.Platform.IOS) {
            window.location.href = StoreLinks.IOS
        } else {
            window.location.href = StoreLinks.ANDROID;
        }
    }
    
}
