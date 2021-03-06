import { IVehicleService } from "../interface/IVehicleService";
import {IVehicle } from './../interface/IVehicle';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { siteURL, ListNames } from "../constant/carpool";
import { SelectListInURL, ErrorStatusText, MapModelToListItem } from "../utilities/utilities";
import { plainToClass } from "class-transformer";
import { VehicleValue } from "VehicleResponse";
import { Vehicle as VehicleItem } from './../model/Vehicle';
import { injectable } from "react-inversify";
import * as AppSetting from 'AppSettings';
import { EVehicleResponseKeys } from "../enum/EVehicleResponseKeys";

@injectable()
 export class VehicleService implements IVehicleService{
    Create= (Vehicle: IVehicle, spHttpClient: SPHttpClient) : Promise<IVehicle>=>{
        const url: string  = `${siteURL}/${SelectListInURL(ListNames.VehicleList)}/items`;
        const options: ISPHttpClientOptions = {
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSetting.tenantAPIKey,
                'odata-version': '3.0'
            },
            body: JSON.stringify(MapModelToListItem.MapVehicleToListItem(Vehicle))
        };
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Create Vehicle Item" + ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((res): IVehicle => {
            const result: VehicleValue = (res as VehicleValue);
            const Value: IVehicle = plainToClass(VehicleItem, result);
            return Value;
        });
    };
     Update = (Vehicle: IVehicle, spHttpClient: SPHttpClient): Promise<boolean> => {
        const url: string  = `${siteURL}/${SelectListInURL(ListNames.VehicleList)}/items('${Vehicle.Id}')`;
        const options: ISPHttpClientOptions = {
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata=nometadata',
                'X-HTTP-METHOD': 'MERGE',
                'odata-version':'3.0',
                'Authorization': 'Bearer ' + AppSetting.tenantAPIKey,
                'If-Match':'*'
            },
            body: JSON.stringify(MapModelToListItem.MapVehicleToListItem(Vehicle))
        };
         return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
             if (!res.ok)
                 throw new Error("Cannot Update Vehicle Item" + ErrorStatusText(res.status, res.statusText));
             return true;
         });
     };
     GetById = (Id: number, spHttpClient: SPHttpClient): Promise<IVehicle> => {
         let fieldRequested: string = '';
         const VehicleFields: string[] = Object.values(EVehicleResponseKeys);
         for (let i = 0; i < VehicleFields.length; i++){
             if (i == VehicleFields.length - 1)
                 fieldRequested+=(VehicleFields[i]);
             else
                 fieldRequested+=VehicleFields[i] + ',';
         }
         const url: string = `${siteURL}/${SelectListInURL(ListNames.VehicleList)}/items('${Id}')?$select=${fieldRequested}`;
        const options: ISPHttpClientOptions = {
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSetting.tenantAPIKey,
                'odata-version':'3.0'
            }
        };
        return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Create Vehicle Item" + ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((res): IVehicle => {
            const result: VehicleValue = (res as VehicleValue);
            const Value: IVehicle = plainToClass(VehicleItem, result);
            return Value;
        }); 
     };
     Delete =  (Id: number, spHttpClient: SPHttpClient) : Promise<boolean>=>{
         const url: string = `${siteURL}/${SelectListInURL(ListNames.VehicleList)}/items('${Id}')`;
         const options: ISPHttpClientOptions = {
             method: "DELETE",
             headers: {
                 'X-HTTP-METHOD':"DELETE"
             }
        }
         return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
             if (!res.ok)
                 throw new Error('Cannot Delete Vehicle.' + ErrorStatusText(res.status, res.statusText));
             return true;
         })
     };
    
}