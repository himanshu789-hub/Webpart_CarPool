import { IVehicle } from "./IVehicle";
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';

export interface IVehicleService 
{
    Create: (Vehicle: IVehicle, spHttpClient: SPHttpClient) => Promise<IVehicle>;
    Update: (Vehicle: IVehicle, spHttpClient: SPHttpClient) => Promise<boolean>;
    GetById: (Id: number, spHttpClient: SPHttpClient) => Promise<IVehicle>;
    Delete: (Id: number, spHttpClient: SPHttpClient) => Promise<boolean>;
    
}