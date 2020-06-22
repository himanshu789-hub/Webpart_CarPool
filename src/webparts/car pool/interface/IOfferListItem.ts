import { EofferingResponseKeys } from "../enum/EOfferingResponseKeys";
import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";

export interface IOfferListItem{
    [EofferingResponseKeys.Destination]: string;
    [EofferingResponseKeys.Discount]: number;
    [EofferingResponseKeys.DistanceFromLastPlace]: number;
    [EofferingResponseKeys.PricePerKM]: number;
    [EofferingResponseKeys.ReachedLocation]: string;
    [EofferingResponseKeys.SeatsOffered]: number;
    [EofferingResponseKeys.Source]: string;
    [EofferingResponseKeys.TotalEarn]: number;
    [EofferingResponseKeys.UserId]: number;
    [EofferingResponseKeys.VehicleId]: number;
    [EofferingResponseKeys.ViaPointIds]: number[];
    [EofferingResponseKeys.Active]: boolean;

}