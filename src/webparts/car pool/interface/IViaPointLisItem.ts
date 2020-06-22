import { EViaPointResponseKeys } from "../enum/EViaPointResponseKeys";

export interface IViaPointListItem{
    [EViaPointResponseKeys.DistanceFromLastPlace]: number;
    [EViaPointResponseKeys.Place]: string;
}