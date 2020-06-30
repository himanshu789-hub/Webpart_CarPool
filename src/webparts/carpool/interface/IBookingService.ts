import { IBooking } from "./IBooking";
import IBookingStatus from "./BookingStatus";
import { SPHttpClient } from '@microsoft/sp-http';

export  interface IBookingService {
    Create: (Book: IBooking,spHttpClient:SPHttpClient) => Promise<IBooking>;
    UpdateBookingStatus: (BookingStatus: IBookingStatus,spHttpClient:SPHttpClient) =>Promise<boolean>;
    GetAllByUserId: (UserId: number, spHttpClient:SPHttpClient) => Promise<IBooking[]>;
    GetAllOfferedRidesBooking: (OfferIds: number[],spHttpClient:SPHttpClient) => Promise<IBooking[]>;
    IsUnderBooking:(UserId:number,spHttpClient:SPHttpClient)=>Promise<boolean>;
    GetById:(BookId:number,spHttpClient:SPHttpClient)=>Promise<IBooking>;
 }