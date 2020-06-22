import { IOffering } from "./IOffering";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IUpdateLocationInfo } from "./IUpdateLocationInfo";
import { IBookingRequestInfo } from "./IBookingRequestInfo";

export interface IOfferService {
    IsUnderOfferring: (UserId: number, spHttpClient: SPHttpClient) => Promise<boolean>;
    GetById: (OfferId: number, spHttpClient: SPHttpClient) =>Promise<IOffering>;
    Delete: (OfferInfo:number, spHttpClient: SPHttpClient) => Promise<boolean>;
    GetAllByUserId: (UserId: number, spHttpClient: SPHttpClient) => Promise<IOffering[]>;
    UpdateLocation: (UpdateOfferInfo: IUpdateLocationInfo, spHttpClient: SPHttpClient) => Promise<boolean>;
    Update: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => Promise<IOffering>;
    Create: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => Promise<IOffering>;
    GetByEndPonits: (BookingRequestInfo: IBookingRequestInfo, spHttpClient: SPHttpClient) => Promise<IOffering[]>;
}
