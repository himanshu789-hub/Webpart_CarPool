import { ICoordinateInfo } from "./ICoordinateInfo";
import { IDistanceInfo } from "./IDistanceInfo";
import { IDistanceQueryInfo } from "./IDistanceQueryInfo";
import { StringifyCoordinate } from "../utilities/utilities";

export interface IDistanceService{
    GetDistance(origin: ICoordinateInfo, destination: ICoordinateInfo):Promise< IDistanceInfo>;
}