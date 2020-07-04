import { IBooking } from "./IBooking";
import IBookingStatus from "./BookingStatus";
import { SPHttpClient } from '@microsoft/sp-http';

export  interface IBookingService {
    Create: (Book: IBooking,spHttpClient:SPHttpClient) => Promise<IBooking>;
    UpdateBookingStatus: (BookingStatus: IBookingStatus,spHttpClient:SPHttpClient) =>Promise<boolean>;
    GetAllByUserId: (UserId: number, spHttpClient:SPHttpClient) => Promise<IBooking[]>;
    GetAllOfferedRidesBooking: (OfferIds: number[],spHttpClient:SPHttpClient) => Promise<IBooking[]>;
    IsUnderBooking:(UserId:number,spHttpClient:SPHttpClient)=>Promise<number>;
    GetById: (BookId: number, spHttpClient: SPHttpClient) => Promise<IBooking>;
    GetCountByLocation:(OffeerId:number,Location: string, LocationType: number, spHttpClient: SPHttpClient)=>Promise<number> ;
    GetIdOfBookingNotAcceptedUntillReachedLocationByOfferId: (OfferId:number,ReachedLocation: string, spHttpClient: SPHttpClient) => Promise<number[]>; 
    GetAllCompleted: (OfferId: number, Destination: string, spHttpClient: SPHttpClient) => Promise<number[]>;
}