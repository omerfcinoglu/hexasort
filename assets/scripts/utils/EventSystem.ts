import { _decorator, EventTarget } from 'cc';
const { ccclass } = _decorator;

@ccclass('EventSystem')
export class EventSystem {
    private static _instance: EventSystem | null = null;
    private eventTarget: EventTarget = new EventTarget();

    private constructor() {}

    public static getInstance(): EventSystem {
        if (!this._instance) {
            this._instance = new EventSystem();
        }
        return this._instance;
    }

    public on(eventType: string, callback: (...args: any[]) => void, target?: any) {
        this.eventTarget.on(eventType, callback, target);
    }

    public off(eventType: string, callback: (...args: any[]) => void, target?: any) {
        this.eventTarget.off(eventType, callback, target);
    }

    public emit(eventType: string, ...args: any[]) {
        this.eventTarget.emit(eventType, ...args);
    }
}