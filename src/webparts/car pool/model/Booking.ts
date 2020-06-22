import { IBooking } from "../interface/IBooking";
import { BookingStatus } from "../constant/carpool";
import { Expose } from 'class-transformer';
import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";

export class Booking implements IBooking{
    
    Id: number;
    
    @Expose({ name: EBookingResponseKeys.Status })
    Status: string;
    CummuterRef: number;
    Destination: string;
    FarePrice: number;
    Source: string;
    @Expose({name:EBookingResponseKeys.PassengerRef})
    PassengerRef: number;
    constructor() {
        this.Id = 0;
        this.Destination = '';
        this.CummuterRef = null;
        this.FarePrice = 0;
        this.PassengerRef = null;
        this.Source = '';
        this.SeatsRequired = 0;
        this.Status = BookingStatus.NOTREQUESTED;
        this.DateTimeOfBooking = null;
}
    DateTimeOfBooking: Date;
    SeatsRequired: number;
}