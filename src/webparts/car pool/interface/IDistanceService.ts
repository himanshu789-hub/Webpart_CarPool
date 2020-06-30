import { ICoordinateInfo } from "./ICoordinateInfo";
import { IDistanceInfo } from "./IDistanceInfo";
import { IDistanceQueryInfo } from "./IDistanceQueryInfo";
import { ParseCoordinate } from "../utilities/utilities";

export interface IDistanceService{
    GetDistance(origin: ICoordinateInfo, destination: ICoordinateInfo): IDistanceInfo;
}