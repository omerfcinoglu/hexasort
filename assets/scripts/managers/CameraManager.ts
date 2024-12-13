import { _decorator, Component, Camera, tween } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('CameraManager')
export class CameraManager extends SingletonComponent<CameraManager> {
    @property(Camera)
    public mainCamera: Camera | null = null;

    @property
    public minOrthoHeight: number = 5;

    @property
    public maxOrthoHeight: number = 20;

    zoom(inOrOut: boolean, duration: number) {
        if (!this.mainCamera) {
            console.error('Main camera is not assigned.');
            return;
        }

        const currentOrthoHeight = this.mainCamera.orthoHeight;
        const targetOrthoHeight = inOrOut
            ? Math.max(this.minOrthoHeight, currentOrthoHeight - 5) // Zoom In
            : Math.min(this.maxOrthoHeight, currentOrthoHeight + 5); // Zoom Out

        tween(this.mainCamera)
            .to(
                duration,
                { orthoHeight: targetOrthoHeight },
                { easing: 'quadOut' }
            )
            .start();
    }
}
