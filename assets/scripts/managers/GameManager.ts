import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { GroundTile, GroundTileStates } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { NeighborHandler } from "../handlers/NeighborHandler";
import { StackHandler } from "../handlers/StackHandler";
import { LevelConfig } from "../../data/LevelConfig";
import { EventSystem } from "../utils/EventSystem";
import { Events } from "../../data/Events";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;

    @property(SelectableManager)
    selectableManager: SelectableManager | null = null;

    private level_id = 1;

    tilePlacementHandler: TilePlacementHandler | null = null;
    neighborHandler: NeighborHandler | null = null;
    stackHandler: StackHandler | null = null;

    onLoad(): void {
        this.tilePlacementHandler = new TilePlacementHandler();

        const levelMatrix = LevelConfig.getLevelMatrix(this.level_id);
        if (levelMatrix) this.gridManager?.setGrid(levelMatrix);

        const startTiles = LevelConfig.getStartTiles(this.level_id);
        if (this.selectableManager && startTiles) this.selectableManager.init(startTiles);

        TileSelectionHandler.placementEvent.on("placement", this.onPlacementTriggered, this);
    }

    onDestroy() {
        TileSelectionHandler.placementEvent.off("placement", this.onPlacementTriggered, this);
    }

    async onPlacementTriggered(selectedTile: SelectableTiles) {
        const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
        if (placedGround) {
            placedGround.highlight(false);
            placedGround.state = GroundTileStates.Ready
            EventSystem.getInstance().emit(Events.MarkGrounds);
            return;
        }
    }

}