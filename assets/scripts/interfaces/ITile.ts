/**
 * @param type chosing color from ColorProvider by type number
 * @function init setting up color 
 */

export interface ITile {
    type: number;
    name : string;
    init(type: number): void; 
}
