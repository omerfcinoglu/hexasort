import { _decorator, Component } from 'cc';
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
            this.unlock();
        }, 5000);
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

}
