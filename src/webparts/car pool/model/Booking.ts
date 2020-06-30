import { IBooking } from "../interface/IBooking";
import { BookingStatus } from "../constant/carpool";

export class Booking implements IBooking{
    Id: number;
    Status: string;
    CummuterRef: number;
    Destination: string;
    FarePrice: number;
    Source: string;
    PassengerRef: string;
    constructor() {
        this.Id = 0;
        this.Destination = '';
        this.CummuterRef = null;
        this.FarePrice = 0;
        this.PassengerRef = null;
        this.Source = '';
        this.Status = BookingStatus.NOTREQUESTED;
}
}