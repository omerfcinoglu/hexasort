import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('LockableComponent')
export class LockableComponent extends Component {
    private _isLocked: boolean = false;

    public get isLocked(): boolean {
        return this._isLocked;
    }

    public lock(): void {
        if (this._isLocked) {
            console.warn(`${this.node.name} is already locked!`);
        } else {
            this._isLocked = true;
            console.log(`${this.node.name} locked.`);
        }
    }

    public unlock(): void {
        if (!this._isLocked) {
            console.warn(`${this.node.name} is not locked!`);
        } else {
            this._isLocked = false;
            console.log(`${this.node.name} unlocked.`);
        }
    }

    public tryLock(): boolean {
        if (this._isLocked) {
            console.warn(`${this.node.name} is already locked!`);
            return false;
        }
        this.lock();
        return true;
    }
}
