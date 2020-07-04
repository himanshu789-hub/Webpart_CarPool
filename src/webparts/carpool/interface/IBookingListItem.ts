import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";

export interface IBookingListItem{
    [EBookingResponseKeys.CummuterRef]: number;
    [EBookingResponseKeys.Destination]: string;
    [EBookingResponseKeys.FarePrice]: number;
    [EBookingResponseKeys.PassengerRef]: number;
    [EBookingResponseKeys.Source]: string;
    [EBookingResponseKeys.Status]: string;
    [EBookingResponseKeys.Time]: string;
    [EBookingResponseKeys.DestinationCoords]: string;
    [EBookingResponseKeys.SourceCoords]: string;
    [EBookingResponseKeys.DateOfBooking]: string;
    [EBookingResponseKeys.SeatsRequired]: number;
}