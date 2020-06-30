import { injectable } from 'react-inversify';
import { ILocationInfo } from '../interface/ILocationInfo';
import ILocationSuggestService from '../interface/ILocationSuggestService';
import { ILocationQueryInfo } from '../interface/ILocationQueryInfo';
import { CurrentLocation } from '../module/location.module';
import { ParseCoordinate } from '../utilities/utilities';
import { ICoordinateInfo } from '../interface/ICoordinateInfo';
@injectable()
export class LocationService implements ILocationSuggestService 
{
    ApiKey: string;
    GetSuggestion=(Place:string):ILocationInfo[]=>{
        CurrentLocation.RequestForCoordinates();
        const coords: ICoordinateInfo = CurrentLocation.GetCurrentCoordinates();
        
        let parameter: ILocationQueryInfo = {
            key: this.ApiKey,
            maxResults: 10,
            query: Place,
            userLocation:ParseCoordinate(coords)
        }

        return axios.get('http://dev.virtualearth.net/REST/v1/Locations', {
                params: { ...query },
        });
    }
    constructor()
    {
        this.ApiKey = 'Aq2eQ5lQBt_m1lBEQ5bFbFnP1b27g27lNGxqFCt_gtpXtmoSsEXVWw7aYfUh_Cvf'; 
    }
}