import { _decorator, Component, Color, MeshRenderer } from 'cc';
import { ColorProvider } from '../core/ColorProvider';
const { ccclass } = _decorator;

@ccclass('LockableComponent')
export class LockableComponent extends Component {
    private _isLocked: boolean = false;
    private _lockTimeout;

    public get isLocked(): boolean {
        return this._isLocked;
    }

    public lock(): void {
        if (this._isLocked) return;
        this._isLocked = true;
    
        this._lockTimeout = setTimeout(() => {
            // console.warn(`${this.node.name} lock timeout! Unlocking.`);
            this.unlock();
        }, 1000);
    }
    
    public unlock(): void {
        if (!this._isLocked) return;
        this._isLocked = false;
    
        if (this._lockTimeout) {
            clearTimeout(this._lockTimeout);
            this._lockTimeout = null;
        }
    }

    public tryLock(): boolean {
        if (this._isLocked) {
            return false;
        }
        this.lock();
        return true;
    }

    private ChangeDiffuseColor(color: Color): void {
        const meshRenderer = this.node.getComponentInChildren(MeshRenderer); // MeshRenderer'ı bul
        if (meshRenderer) {
            ColorProvider.ChangeDiffuseColor(color, meshRenderer); // ColorProvider ile rengi değiştir
        } else {
            console.error(`MeshRenderer not found on node ${this.node.name}.`);
        }
    }
}
