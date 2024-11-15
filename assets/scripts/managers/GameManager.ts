// GameManager.ts
import { _decorator, Component } from "cc";
import { GridManager } from "./GridManager";
import { NeighborChecker } from "../core/NeighborChecker";
import { TileSelectionHandler } from "../handlers/TileSelectionHandler";
import { TilePlacementHandler } from "../handlers/TilePlacementHandler";
import { TileTransferHandler } from "../handlers/TileTransferHandler";
import { GroundTile } from "../entity/GroundTile";
import { SelectableTiles } from "../entity/SelectableTiles";
import { SelectableManager } from "./SelectableManager";
import { sleep } from "../helpers/Promises";
import { TileAnimator } from "../helpers/TileAnimator";

const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
     @property(GridManager)
     gridManager: GridManager | null = null;

     @property(TilePlacementHandler)
     tilePlacementHandler: TilePlacementHandler | null = null;

     @property(SelectableManager)
     private selectableManager: SelectableManager | null = null;

     private matchStackCount: number = 12;
     private neighborChecker: NeighborChecker | null = null;
     private tileTransferHandler: TileTransferHandler | null = null;

     // @property(PlacementHandler) placementHandler: PlacementHandler | null = null;
     // @property(NeighborProcessor) neighborProcessor: NeighborProcessor | null = null;
     // @property(TransferHandler) transferHandler: TransferHandler | null = null;
     // @property(StackManager) stackManager: StackManager | null = null;


     private transferedGrounds: GroundTile[] = [];
     onLoad(): void {
          this.neighborChecker = new NeighborChecker();
          this.tileTransferHandler = new TileTransferHandler();
          if (this.selectableManager) this.selectableManager.init();
          TileSelectionHandler.placementEvent.on('placement', this.onPlacementTriggered, this);
     }

     onDestroy() {
          TileSelectionHandler.placementEvent.off('placement', this.onPlacementTriggered, this);
     }

     async onPlacementTriggered(selectedTile: SelectableTiles) {
          const placedGround = await this.tilePlacementHandler?.place(selectedTile, this.selectableManager);
          if (placedGround) {
               // const transferedGrounds = await this.neighborProcessor?.processNeighbors(placedGround);
               // await this.stackManager?.processStacks(transferedGrounds);
          }
     }
}
