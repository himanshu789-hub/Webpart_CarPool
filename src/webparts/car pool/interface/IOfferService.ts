import { IOffering } from "./IOffering";
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IUpdateLocationInfo } from "./IUpdateLocationInfo";
import { IBookingRequestInfo } from "./IBookingRequestInfo";

export interface IOfferService {
    IsUnderOfferring: (UserId: number, spHttpClient: SPHttpClient) => boolean;
    GetById: (OfferId: number, spHttpClient: SPHttpClient) => IOffering;
    Delete: (OfferInfo: IOffering, spHttpClient: SPHttpClient) => boolean;
    GetAllByUserId: (UserId: number, spHttpClient: SPHttpClient) => IOffering[];
    UpdateLocation: (UpdateOfferInfo: IUpdateLocationInfo, spHttpClient: SPHttpClient) => boolean;
    Update: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => IOffering;
    Create: (OfferDTO: IOffering, spHttpClient: SPHttpClient) => IOffering;
    GetByEndPonits: (BookingRequestInfo: IBookingRequestInfo, spHttpClient: SPHttpClient) => IOffering[];
}
