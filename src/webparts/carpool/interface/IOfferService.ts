import { IOffering } from "./IOffering";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IUpdateLocationInfo } from "./IUpdateLocationInfo";
import { IBookingRequestInfo } from "./IBookingRequestInfo";
import { IOfferRouteAndSeatInfo } from "./IOfferRouteAndSeatInfo";
import { IBookingService } from "./IBookingService";
import { IOfferRequestInfo } from "./IOfferRequestInfo";

export interface IOfferService {
    IsUnderOfferring: (UserId: number, spHttpClient: SPHttpClient) => Promise<number>;
    GetById: (OfferId: number, spHttpClient: SPHttpClient) =>Promise<IOffering>;
    Delete: (OfferInfo:number, spHttpClient: SPHttpClient) => Promise<boolean>;
    GetAllByUserId: (OfferIds: number, spHttpClient: SPHttpClient) => Promise<IOffering[]>;
    UpdateLocation: (UpdateOfferInfo: IUpdateLocationInfo, spHttpClient: SPHttpClient) => Promise<boolean>;
    Update: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => Promise<IOffering>;
    Create: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => Promise<IOffering>;
    GetByEndPonits: (RouteInfos:IOfferRouteAndSeatInfo[],Source:string,Destination:string, SeatsRequired:number, spHttpClient: SPHttpClient) => Promise<number[]>;
    GetAllOnlyIdByUserId: (UserId: number,Active:boolean, spHttpClient: SPHttpClient) => Promise<number[]>;
    GetRouteAndSeatsOfferedOfAllActiveOffer: (OfferRequestInfo:IOfferRequestInfo,spHttpClient: SPHttpClient)=>Promise<IOfferRouteAndSeatInfo[]>;
    setBookingService(BookingService: IBookingService): void;
    StartARide: (Id: number, spHttpClient: SPHttpClient) => Promise<boolean>;
}
