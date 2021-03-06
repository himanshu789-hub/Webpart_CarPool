import { injectable } from 'react-inversify';
import { ILocationInfo } from '../interface/ILocationInfo';
import { ILocationSuggestService }from '../interface/ILocationSuggestService';
import { ILocationQueryInfo } from '../interface/ILocationQueryInfo';
import { CurrentLocation } from '../module/location.module';
import { StringifyCoordinate } from '../utilities/utilities';
import { ICoordinateInfo } from '../interface/ICoordinateInfo';
import * as AppSettings from 'AppSettings';
import axios from 'axios';
import { BingMapsResults } from 'BingMapsLocation';
import { RejectError } from '../exception/CoordinateException';

@injectable()
export class LocationService implements ILocationSuggestService 
{
    GetSuggestion=(Place:string):Promise<ILocationInfo[]>=>{
        const coords: ICoordinateInfo = CurrentLocation.GetCurrentCoordinates();    
        if (!coords)
            throw new RejectError('Request Rejected . . .');
        debugger;
        const d = AppSettings.serverRelativeURL;
        let parameter: ILocationQueryInfo = {
            key:AppSettings.BingMaps.APIKey,
            maxResults: 10,
            query: Place,
            userLocation:StringifyCoordinate(coords)
        }

        return axios.get(AppSettings.BingMaps.LocationServiceURL, {
                params: { ...parameter },
        }).then((res): ILocationInfo[] => {
            if ((res.status / 100 )== 2)
            {
                const result:BingMapsResults = res.data as BingMapsResults;
                const Location: ILocationInfo[] = result.resourceSets[0].resources.map((e) : ILocationInfo => {
                    return { Coordinates: { Lattitude: e.point.coordinates[0]+'', Longitude: e.point.coordinates[1]+'' },Name:e.name };
                });
                return Location;
            }
            return null;
        });
    }
}