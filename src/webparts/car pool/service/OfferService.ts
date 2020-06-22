import { injectable } from 'react-inversify';
import { IUpdateLocationInfo } from '../interface/IUpdateLocationInfo';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IOffering } from '../interface/IOffering';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
import * as AppSettings from 'AppSettings';
import { SelectListInURL, ErrorStatusText, MapModelToListItem } from '../utilities/utilities';
import { OfferEntitySet, UserEntitySet, siteURL } from './../constant/carpool';
import { IBookingRequestInfo } from '../interface/IBookingRequestInfo';
import { IOfferService } from './../interface/IOfferService';
import { OfferListItemResponse, OfferValue } from 'OfferingTyping';
import { plainToClass } from 'class-transformer';
import { Offering } from '../model/Offering';
import { IOfferListItem } from '../interface/IOfferListItem';

@injectable()
export class OfferService implements IOfferService {
	IsUnderOfferring = (UserId: number, spHttpClient: SPHttpClient): Promise<boolean> => {
		const url: string = `${AppSettings.tenantURL}${AppSettings.serverRelativeURL}${SelectListInURL(
			OfferEntitySet,
        )}/items?$filter=(${EofferingResponseKeys.UserId} eq '${UserId}') and (${EofferingResponseKeys.Active} eq 1)`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': "application/json;odata=nometadata",
                'Content-Type':'application/json'
            }
        }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((res)=> {
            const results: OfferListItemResponse = res as OfferListItemResponse;
            if (results.value.length != 0)
                return true;
            return false;
        });
    };
    
	Delete = (OfferId: number, spHttpClient: SPHttpClient): Promise<boolean> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${OfferId}')`;
        const options: ISPHttpClientOptions = {
            body: JSON.stringify({ [EofferingResponseKeys.Active]: false }),
            headers: {
                'Content-Type': 'application/json',
                'X-Http-Method':"MERGE"
            },
            method:"PATCH"
        }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            if (res.status == 200 || res.status == 204)
                return true;
            return false;
        });
    }
    
	GetById = (OfferId: number, spHttpClient: SPHttpClient): Promise<IOffering> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${OfferId})?$select=RoutingEnabled,DestinationPlace,SourcePlace,ViaPointRefs/Id,ViaPointRefs/Place,RideStartTime,ViaPointRefs/DistanceFromLastPlace,Discount,VehicleRefId,DistanceFromLastPlace,PricePerKM,ReachedLocation,Id,Setas_x0020_Offered,TotalEarn&$expand=ViaPointRefs`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata'
            }
        };
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((response):IOffering => {
            const results: OfferValue[] = (response as OfferListItemResponse).value;
            const offer: IOffering = plainToClass(Offering, results[0]);
            return offer;
        });
    }

	GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): Promise<IOffering[]> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items$select=RoutingEnabled,DestinationPlace,SourcePlace,ViaPointRefs/Id,ViaPointRefs/Place,RideStartTime,ViaPointRefs/DistanceFromLastPlace,Discount,VehicleRefId,DistanceFromLastPlace,PricePerKM,ReachedLocation,Id,Setas_x0020_Offered,TotalEarn&$expand=ViaPointRefs&$filter=(${
			EofferingResponseKeys.UserId
            } eq '${UserId}')`;
        
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept':'application/json;odata=nometadata'
            }
        }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((response):IOffering[] => {
            const results = (response as OfferListItemResponse).value;
            let Offers: IOffering[] = [];
            results.map((e) => Offers.push(plainToClass(Offering, e)));
            return Offers;
        });
	}

	UpdateLocation = (
		UpdateLocationInfo: IUpdateLocationInfo,
		spHttpClient: SPHttpClient,
	): Promise<boolean> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items(${
			UpdateLocationInfo.OfferId
		})`;
        const options: ISPHttpClientOptions = {
            headers: {
                'X-Http-Method':"MERGE"
            },
            method: "PATCH",
            body:JSON.stringify({
                [EofferingResponseKeys.ReachedLocation]: UpdateLocationInfo.ReachedLocation,
            })
        }

        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(`Error in Updating Location.${ErrorStatusText(res.status, res.statusText)}`);
            if (res.status == 200 || res.status == 204 || res.status == 202)
                return true;
            return false;
        });
	};
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
	Update = (Offer: IOffering, spHttpClient: SPHttpClient):Promise<IOffering> => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${Offer.Id}')`;
        
        const options: ISPHttpClientOptions = {
            body: JSON.stringify(MapModelToListItem.MapOfferToListItem(Offer)),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'appplication/json;odata=nometadata',
                'Authorization':'Bearer '+AppSettings.tenetAPIKey
            },
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error('Cannot Create Offer Item.' + ErrorStatusText(res.status, res.statusText));
            return Offer;
        })
	};

	Create = (Offer: IOffering,spHttpClient:SPHttpClient): Promise<IOffering> => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items`;
      
        const options: ISPHttpClientOptions = {
            body: JSON.stringify( MapModelToListItem.MapOfferToListItem(Offer)),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'appplication/json;odata=nometadata',
                'Authorization':'Bearer '+AppSettings.tenetAPIKey
            },
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error('Cannot Create Offer Item.' + ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then(response => {
            const NewOffer: OfferValue = response as OfferValue;
            Offer.Id = NewOffer.Id;
            return Offer;
        });
    };
	///Difficult Query . . .
	GetByEndPonits = (BookingRequestInfo: IBookingRequestInfo,spHttpClient:SPHttpClient):Promise<IOffering[]> => {
		const payload: String = new String(JSON.stringify(BookingRequestInfo));
        return null;
	};
 }
