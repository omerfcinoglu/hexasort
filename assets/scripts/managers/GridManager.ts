import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { GroundTile, GroundTileStates } from '../entity/GroundTile';
import { GridGenerator } from '../core/GridGenerator';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
const { ccclass, property } = _decorator;

@ccclass("GridManager")
export class GridManager extends SingletonComponent<GridManager> {
    @property({ type: Prefab })
    public groundTilePrefab: Prefab = null!;

    @property({ type: Prefab })
    public tileClusterPrefab: Prefab = null!;

    @property(Node)
    public gridArea: Node = null!;

    @property
    public tileSize: number = 1;

    private grid: GroundTile[][] = [];

    private gridGenerator: GridGenerator = null;

    onLoad(): void {
        super.onLoad();
        this.gridGenerator = new GridGenerator(
            this.groundTilePrefab,
            this.tileClusterPrefab,
            this.tileSize
        )
    }
    registerEvent(): void {
        EventSystem.getInstance().on(Events.MarkGrounds, this.MarkGrounds.bind(this), this);
    }

    private MarkGrounds() {
        let markedGrounds = []

        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node && groundTile.state == GroundTileStates.Ready) {
                    groundTile.state = GroundTileStates.Busy
                    markedGrounds.push(groundTile)
                }
            });
        });
        
        EventSystem.getInstance().emit(Events.ProcessMarkedGround , markedGrounds);
    }

    public setGrid(levelMatrix: number[][]): void {
        this.grid = this.gridGenerator.generateGrid(levelMatrix, this.gridArea);
    }

    public getGrid(): GroundTile[][] {
        return this.grid;
    }


    public getGroundTile(row: number, col: number): GroundTile | null {
        if (this.grid[row] && this.grid[row][col]) {
            return this.grid[row][col];
        }
        return null;
    }

    public resetGrid(): void {
        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node) {
                    groundTile.node.destroy();
                }
            });
        });
        this.grid = [];
    }


    public resetHighlight(): void{
        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node) {
                    groundTile.highlight(false);
                }
            });
        });
    }

    public ClearStack(): void {
        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node) {
                    groundTile.clearAllTiles(0.1);
                }
            });
        });
    }

    public CheckStack(): void {
        this.grid.forEach(row => {
            row.forEach(groundTile => {
                if (groundTile.node) {
                    groundTile.clearAllTiles(0.1);
                }
            });
        });
    }

}


