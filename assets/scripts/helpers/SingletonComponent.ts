import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property, disallowMultiple } = _decorator;

@disallowMultiple
export abstract class SingletonComponent<T extends SingletonComponent<T>> extends Component {
    private static instances: Map<new () => SingletonComponent<any>, SingletonComponent<any>> = new Map();

    protected onLoad(): void {
        const instance = SingletonComponent.instances.get(this.constructor as new () => SingletonComponent<any>);
        if (!instance) {
            SingletonComponent.instances.set(this.constructor as new () => SingletonComponent<any>, this);
            director.addPersistRootNode(this.node);
        } else if (instance !== this) {
            // this.destroy();
            console.warn(`Another instance of ${this.constructor.name} was attempted to be created and was destroyed.`);
            return;
        }
    }

    public static getInstance<T extends SingletonComponent<T>>(this: new () => T): T {
        let instance = SingletonComponent.instances.get(this);
        if (!instance) {
            instance = new this();
            SingletonComponent.instances.set(this, instance);
        }
        return instance as T;
    }
}