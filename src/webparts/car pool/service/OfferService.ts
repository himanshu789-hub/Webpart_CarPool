import axios, { AxiosResponse } from 'axios';
import { injectable } from "react-inversify";
import {IUpdateLocationInfo } from "../interface/IUpdateLocationInfo";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IOffering } from "../interface/IOffering";
import { EofferingResponseKeys } from "../enum/EOfferingResponseKeys";
import * as AppSettings from 'AppSettings';
import { SelectListInURL } from "../utilities/utilities";
import { OfferEntitySet, UserEntitySet ,siteURL} from './../constant/carpool';
import { IBookingRequestInfo } from "../interface/IBookingRequestInfo";
import { IOfferService } from './../interface/IOfferService';

@injectable()
export class OfferService implements IOfferService {
    IsUnderOfferring = (UserId: number, spHttpClient: SPHttpClient): boolean => {
        const url:string = `${AppSettings.tenantURL}${AppSettings.serverRelativeURL}${SelectListInURL(UserEntitySet)}/items(${UserId})`
        return axios.get(APIServer + 'Offerring/IsOfferredRide', { params: { userId: UserId } });
    }
    Delete = (OfferId:number ,spHttpClient: SPHttpClient): boolean => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${OfferId}')`;
        // make Active to false
        const payload = {
            [EofferingResponseKeys.Active]: false
        };

        return axios.delete(APIServer + 'Offerring/Delete', { data: payload });
    }
    GetById = (OfferId: number,spHttpClient: SPHttpClient): IOffering => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${OfferId})`;
        return axios.get(APIServer + 'Offerring/GetById', { params: { id: OfferId } });
    }
    GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): IOffering[] => {
        const url:string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items$filter=${EofferingResponseKeys.UserId} eq ${UserId}`
        return axios.get(APIServer + 'Offerring/GetByUserId', { params: { userId: UserId } });
    }
    UpdateLocation = (UpdateLocationInfo: IUpdateLocationInfo,spHttpClient: SPHttpClient): boolean => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items(${UpdateLocationInfo.OfferId})`;
        const payload = {
            [EofferingResponseKeys.ReachedLocation]: UpdateLocationInfo.ReachedLocation
        };
        return axios.put(APIServer + 'Offerring/updateLocation', payload);
    }
 /*HandleNextLocation = (OfferInfo: IOfferInfo, spHttpClient: SPHttpClient): string => {
        // to be think  . . .
        const payload: String = new String(JSON.stringify(OfferInfo));
        return axios.put(APIServer + 'Offerring/handleNextLocation', payload);
    } It would be a utility function*/
  /*   StartRide(Id:number,Source:string,spHttpClient: SPHttpClient): boolean {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${Id}')`;
        const payload: string = JSON.stringify({
            [EofferingResponseKeys.ReachedLocation] : Source
        }); return axios.put(APIServer + 'Offerring/StartRide', payload);}
        A part of UpdateOfferLlocation*/
    Update = (Offer: IOffering,spHttpClient: SPHttpClient): IOffering => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${Offer.Id}')`;
        return axios.put(APIServer + '/Offerring/Update', { data: { offerring: IOffering } });
    }

    Create = (OfferDTO: IOffering): IOffering => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items`;
        return axios.post(APIServer + '/Offerring/Create', { data: { offerring: OfferDTO } });
    }
    ///Difficult Query . . .
    GetByEndPonits = (BookingRequestInfo: IBookingRequestInfo): IOffering[]=>
    {

        const payload: String = new String(JSON.stringify(BookingRequestInfo));
      
        return axios.get(APIServer + 'Offerring/GetByEndPoints', { params: { form: payload, headers: { 'Content-Type': 'application/json' } } });
    }
}
