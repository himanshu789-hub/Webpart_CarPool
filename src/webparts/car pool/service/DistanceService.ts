import { IDistanceService } from "../interface/IDistanceService";
import { IDistanceInfo } from "../interface/IDistanceInfo";
import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { IDistanceQueryInfo } from "../interface/IDistanceQueryInfo";
import { ParseCoordinate } from "../utilities/utilities";
import * as appSettings from 'AppSettings';
import { TravelModeValue } from "../constant/carpool";
export class DistanceService implements IDistanceService{
    GetDistance(origin: ICoordinateInfo, destination:ICoordinateInfo): IDistanceInfo {
        let parameter: IDistanceQueryInfo = {
            destinations: ParseCoordinate(destination),
            origins: ParseCoordinate(origin),
            key: appSettings.BingMaps.APIKey,
            travelMode: TravelModeValue
        };
        

    }
}