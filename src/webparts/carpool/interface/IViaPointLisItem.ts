import { EViaPointResponseKeys } from "../enum/EViaPointResponseKeys";

export interface IViaPointListItem{
    [EViaPointResponseKeys.DistanceFromLastPlace]: number;
    [EViaPointResponseKeys.Place]: string;
    [EViaPointResponseKeys.Coords]: string;
    [EViaPointResponseKeys.Coords]: string;
}