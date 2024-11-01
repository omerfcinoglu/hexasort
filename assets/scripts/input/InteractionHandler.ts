import { _decorator, Component, Node, Color } from 'cc';
import { InputProvider } from './InputProvider';
const { ccclass, property } = _decorator;

@ccclass("InteractionHandler")
export class InteractionHandler extends Component {
    @property(InputProvider)
    inputProvider: InputProvider = null!;

    onLoad() {
        this.inputProvider.onRaycastResult = this.handleRaycastResult.bind(this);
    }

    handleRaycastResult(resultNode: Node | null) {
        if (resultNode) {
            console.log("Hit node:", resultNode.name);
            // Burada farklı etkileşimleri yönetebilirsiniz
        } else {
            console.log("No hit detected");
        }
    }
}
