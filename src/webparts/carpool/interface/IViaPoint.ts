import { ICoordinateInfo } from "./ICoordinateInfo";

export interface IViaPoint{
    DistanceFromLastPlace: number;
    Place: string;
    Id: number;
    Coords: ICoordinateInfo;
} 