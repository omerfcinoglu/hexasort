import { _decorator, Component } from "cc";
import { SelectableTiles } from "../entity/SelectableTiles";

const { ccclass } = _decorator;

@ccclass("TilePlacementHandler")
export class TilePlacementHandler extends Component {
    async place(selectedTile: SelectableTiles): Promise<boolean> {
        const targetGround = selectedTile.attachedGround; // SelectableTiles sınıfına bağlı GroundTile'a erişir
        
        if (!targetGround || !selectedTile) return false;

        targetGround.placeSelectableTile(selectedTile , targetGround);
        return true;
    }
}