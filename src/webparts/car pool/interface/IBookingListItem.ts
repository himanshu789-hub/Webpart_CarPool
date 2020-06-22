import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";

export interface IBookingListItem{
    [EBookingResponseKeys.CummuterRef]: number;
    [EBookingResponseKeys.Destination]: string;
    [EBookingResponseKeys.FarePrice]: number;
    [EBookingResponseKeys.PassengerRef]: number;
    [EBookingResponseKeys.Source]: string;
    [EBookingResponseKeys.Status]: string;
}