import { IBooking } from "./IBooking";
import IBookingStatus from "./BookingStatus";
import {SPHttpClient,ISPHttpClientOptions,SPHttpClientResponse } from '@microsoft/sp-http';
export default interface IBookingService {
    Create: (Book: IBooking,spHttpClient:SPHttpClient) => IBooking;
    UpdateBookingStatus: (BookingStatus: IBookingStatus,spHttpClient:SPHttpClient) =>IBooking;
    GetAllByUserId: (UserId: number, spHttpClient:SPHttpClient) => IBooking[];
    GetAllOfferedRidesBooking: (UserId: number,spHttpClient:SPHttpClient) => IBooking[];
    IsUnderBooking:(UserId:number,spHttpClient:SPHttpClient)=>boolean;
    GetById:(BookId:number,spHttpClient:SPHttpClient)=>IBooking;
 }