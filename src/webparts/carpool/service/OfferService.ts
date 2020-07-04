import { injectable } from 'react-inversify';
import { IUpdateLocationInfo } from '../interface/IUpdateLocationInfo';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IOffering } from '../interface/IOffering';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
import * as AppSettings from 'AppSettings';
import { SelectListInURL, ErrorStatusText, MapModelToListItem, MapToRouteInfo } from '../utilities/utilities';
import { OfferEntitySet, UserEntitySet, siteURL, ListNames, ELocationType } from './../constant/carpool';
import { IBookingRequestInfo } from '../interface/IBookingRequestInfo';
import { IOfferService } from './../interface/IOfferService';
import { OfferListItemResponse, OfferValue } from 'OfferingTyping';
import { plainToClass } from 'class-transformer';
import { Offering } from '../model/Offering';
import { IOfferRouteAndSeatInfo } from '../interface/IOfferRouteAndSeatInfo';
import { RootInfoItems, RouteInfoValue} from 'RouteInfo';
import { IBookingService } from '../interface/IBookingService';
import { IOfferRequestInfo } from '../interface/IOfferRequestInfo';
@injectable()
export class OfferService implements IOfferService {
    bookingService: IBookingService = null;
    setBookingService(BookingService: IBookingService) {
        this.bookingService = BookingService;
    };
	IsUnderOfferring = (UserId: number, spHttpClient: SPHttpClient): Promise<number> => {
		const url: string = `${AppSettings.tenantURL}/${AppSettings.serverRelativeURL}/${SelectListInURL(
			OfferEntitySet,
        )}/items?$filter=(${EofferingResponseKeys.UserId} eq '${UserId}') and (${EofferingResponseKeys.Active} eq 1)`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': "application/json;odata=nometadata",
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'odata-version':'3.0'
            }
        }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((res)=> {
            const results: OfferListItemResponse = res as OfferListItemResponse;
            if (results.value.length != 0)
                return results.value[0].Id;
            return null;
        });
    };
    
	Delete = (OfferId: number, spHttpClient: SPHttpClient): Promise<boolean> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items('${OfferId}')`;
        const options: ISPHttpClientOptions = {
            body: JSON.stringify({ [EofferingResponseKeys.Active]: false }),
            headers: {
                'Content-Type': 'application/json',
                'X-Http-Method': "MERGE",
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'Accept': 'application/json;odata=nometadata',
                'odata-version': '3.0',
                'If-Match':'*'
            },
            method:"PATCH"
        }
        debugger;
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
                return true;
        });
    }
    
	GetById = (OfferId: number, spHttpClient: SPHttpClient): Promise<IOffering> => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items(${OfferId})?$select=Id,DriverRefId,IsRideStarted,RoutingEnabled,DestinationPlace,SourcePlace,ViaPointRefs/Place,ViaPointRefs/Id,Time,Date,ViaPointRefs/DistanceFromLastPlace,ViaPointRefs/Coords,Discount,VehicleRefId,DistanceFromLastPlace,PricePerKM,ReachedLocation,Id,Setas_x0020_Offered,TotalEarn,DestinationCoords,SourceCoords&$expand=ViaPointRefs`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': '3.0',
                'Authorization':'Bearer '+AppSettings.tenantAPIKey
            }
        };
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((response):IOffering => {
            const results: OfferValue = response as OfferValue;
        
            const offer: IOffering = plainToClass(Offering, results);
            return offer;
        });
    }

	GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): Promise<IOffering[]> => {
		const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items?$select=DriverRefId,IsRideStarted,RoutingEnabled,DestinationPlace,SourcePlace,ViaPointRefs/Id,ViaPointRefs/Place,Time,Date,ViaPointRefs/DistanceFromLastPlace,ViaPointRefs/Coords,Discount,VehicleRefId,DistanceFromLastPlace,PricePerKM,ReachedLocation,Id,Setas_x0020_Offered,TotalEarn,${EofferingResponseKeys.DestinationCoords},${EofferingResponseKeys.SourceCoords}&$expand=ViaPointRefs&$filter=(${
			EofferingResponseKeys.UserId
            } eq '${UserId}')`;
        
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'odata-version':'3.0'
            }
        }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then((response): IOffering[] => {
            debugger;
            const results = (response as OfferListItemResponse).value;
            let Offers: IOffering[] = [];
            results.map((e) => Offers.push(plainToClass(Offering, e,{excludeExtraneousValues:true})));
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
                'X-Http-Method': "MERGE",
                'Accept': 'application/json;odata=nometadata',
                'odata-version':'3.0',
                'Authorization':"Bearer "+AppSettings.tenantAPIKey,
                'Content-Type': "application/json",
                'If-Match':'*'
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
     
    GetRouteAndSeatsOfferedOfAllActiveOffer = (OfferRequestInfo:IOfferRequestInfo,spHttpClient: SPHttpClient): Promise<IOfferRouteAndSeatInfo[]> => {
        
        const url = `${siteURL}/${SelectListInURL(ListNames.OfferList)}/items?$select=Id,${EofferingResponseKeys.Source},${EofferingResponseKeys.Destination},${EofferingResponseKeys.SeatsOffered},ViaPointRefs/Place&$expand=ViaPointRefs&$filter=(${EofferingResponseKeys.Active} eq '1') and (${EofferingResponseKeys.SeatsOffered} ge '${OfferRequestInfo.SeatsRequired}') and (${EofferingResponseKeys.Date} eq '${OfferRequestInfo.Date}') and (${EofferingResponseKeys.Time} eq '${OfferRequestInfo.Time}')`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'odata-version': '3.0'
            }
        };
        return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
            if (!res.ok)
                throw new Error('Cannot Obtain Route Information.');
            return res.json();
        }).then(response => {
            const results: RouteInfoValue[] = (response as RootInfoItems).value;
            let values: IOfferRouteAndSeatInfo[] = [];
            results.map(e => values.push(MapToRouteInfo(e)));
            return values;
        });
    }
    
	Update = (Offer: IOffering, spHttpClient: SPHttpClient):Promise<IOffering> => {
        const url: string = `${siteURL}/${SelectListInURL(ListNames.OfferList)}/items(${Offer.Id})`;
        debugger;
        const options: ISPHttpClientOptions = {
            body: JSON.stringify(MapModelToListItem.MapOfferToListItem(Offer)),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'If-Match': "*",
                'odata-version':'3.0',
                'X-HTTP-METHOD':'PATCH'
            },
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error('Cannot Update Offer Item\n.' + ErrorStatusText(res.status, res.statusText));
            return Offer;
        });
	};
    StartARide = (Id: number, spHttpClient: SPHttpClient): Promise<boolean> => {
        const url: string = `${siteURL}/${SelectListInURL(ListNames.OfferList)}/items('${Id}')`;
        const options: ISPHttpClientOptions = {
            body: JSON.stringify({ [EofferingResponseKeys.IsRideStarted]: true}),
            headers: {
                'X-HTTP-METHOD':'MERGE',
                'If-Match': '*',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'Accept': 'application/json;odata=nometadata',
                'Content-Type': 'application/json',
                'odata-version':'3.0'
            },
            method: "PATCH"
        };
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then(response => {
            if (!response.ok)
                throw new Error('Unexpected Error' + ErrorStatusText(response.status, response.statusText) + 'Cannot Start Ride');
            return true;
        });
    }
	Create = (Offer: IOffering,spHttpClient:SPHttpClient): Promise<IOffering> => {
        const url: string = `${siteURL}/${SelectListInURL(OfferEntitySet)}/items`;
        debugger;
        const options: ISPHttpClientOptions = {
            body: JSON.stringify(MapModelToListItem.MapOfferToListItem({ ...Offer,IsRideStarted:false })),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json;odata=nometadata',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
                'odata-version': '3.0'
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

    GetByEndPonits = async (RouteInfos: IOfferRouteAndSeatInfo[],Source:string,Destination:string, SeatsRequired: number, spHttpClient: SPHttpClient): Promise<number[]> => {
        let OfferIds: number[] = [];
        if (!this.bookingService)
            throw new Error("Booking Service is Null");
        for (let routeIdx = 0; routeIdx < RouteInfos.length; routeIdx++) {
            let numberofSeatsLeftExceedingDestination = 0;
            const route = RouteInfos[routeIdx].Route;
            const sourceIndex = route.indexOf(Source);
            const destinationIndex = route.indexOf(Destination);
            if (sourceIndex == -1 || destinationIndex == -1 || sourceIndex > destinationIndex)
                continue;
            for (let locationIdx = 0; locationIdx < RouteInfos[routeIdx].Route.length-1; locationIdx++) {
                try{
                    numberofSeatsLeftExceedingDestination += await this.bookingService.GetCountByLocation(RouteInfos[routeIdx].Id, RouteInfos[routeIdx].Route[locationIdx], ELocationType.SOURCE, spHttpClient);
                    numberofSeatsLeftExceedingDestination -= await this.bookingService.GetCountByLocation(RouteInfos[routeIdx].Id,RouteInfos[routeIdx].Route[locationIdx], ELocationType.DESTINATION, spHttpClient);    
                }
                catch (e) {
                    throw new Error("Error Loading\nCannot Get EndPoints.")
                }
            }
            let numberOfSeatsLeftIncludingTillDestination = 0;
            let withinRequestEndIndx = RouteInfos[routeIdx].Route.indexOf(Destination)-1;
            for (let locationIdx = 0; locationIdx < withinRequestEndIndx; locationIdx++) {
                try{
                    numberOfSeatsLeftIncludingTillDestination += await this.bookingService.GetCountByLocation(RouteInfos[routeIdx].Id, RouteInfos[routeIdx].Route[locationIdx], ELocationType.SOURCE, spHttpClient);
                    numberOfSeatsLeftIncludingTillDestination -= await this.bookingService.GetCountByLocation(RouteInfos[routeIdx].Id,RouteInfos[routeIdx].Route[locationIdx], ELocationType.DESTINATION, spHttpClient);    
                }
                catch (e) {
                    throw new Error("Error Loading\nCannot Get EndPoints.")
                }
            }
            
            if ((RouteInfos[routeIdx].SeatsOffered - numberofSeatsLeftExceedingDestination) >= SeatsRequired && (RouteInfos[routeIdx].SeatsOffered - numberOfSeatsLeftIncludingTillDestination) >= SeatsRequired)
                OfferIds = [...OfferIds, RouteInfos[routeIdx].Id];
        }
        return OfferIds;
    };
    GetAllOnlyIdByUserId = (UserId: number,Active:boolean ,spHttpClient: SPHttpClient): Promise<number[]> => {
        const url: string = `${siteURL}/${SelectListInURL(ListNames.OfferList)}/items?$select=Id&$filter=(DriverRefId eq '${UserId}') and (${EofferingResponseKeys.Active} eq ${Active?'1':'0'})`;
        const options: ISPHttpClientOptions = {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'odata-version': '3.0',
                'Authorization': "Bearer " + AppSettings.tenantAPIKey
            }
        };
    return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then(response => {
            const results = (response.value);
            return [...results.map((e):number=>e.Id)];
        });
    }
 }
