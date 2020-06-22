import { IDistanceService } from "../interface/IDistanceService";
import { IDistanceInfo } from "../interface/IDistanceInfo";
import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { IDistanceQueryInfo } from "../interface/IDistanceQueryInfo";
import { ParseCoordinate } from "../utilities/utilities";
import * as appSettings from 'AppSettings';
import { TravelModeValue } from "../constant/carpool";
import axios, { AxiosResponse } from 'axios';
import {BingMapsDistanceResults } from 'BingMapsDistance';
export class DistanceService implements IDistanceService{
    
    GetDistance(origin: ICoordinateInfo, destination: ICoordinateInfo): Promise<IDistanceInfo> {
        let parameter: IDistanceQueryInfo = {
            destinations: ParseCoordinate(destination),
            origins: ParseCoordinate(origin),
            key: appSettings.BingMaps.APIKey,
            travelMode: TravelModeValue
        };
      return  axios.get(appSettings.BingMaps.DistanceServiceURL, {
            params: {
                ...parameter
            }
        }).then((response: AxiosResponse): IDistanceInfo => {
            const results = response.data as BingMapsDistanceResults;
            return { Distance: results.resourceSets[0].resources[0].results[0].travelDistance, Time: results.resourceSets[0].resources[0].results[0].travelDuration + '' };
        });
    }
}