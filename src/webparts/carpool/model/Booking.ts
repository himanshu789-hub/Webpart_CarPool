import { IBooking } from "../interface/IBooking";
import { BookingStatus } from "../constant/carpool";
import { Expose, Transform } from 'class-transformer';
import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";
import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { ParseCoordinate, ConvertDateToFormat } from "../utilities/utilities";

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
        this.DateOfBooking = null;
        this.Time = null;
    }
    @Expose({ name: EBookingResponseKeys.SourceCoords })
    @Transform(value => ParseCoordinate(value))
    SourceCoords: ICoordinateInfo;

    @Expose({ name: EBookingResponseKeys.DestinationCoords })
    @Transform(value => ParseCoordinate(value))
    DestinationCoords: ICoordinateInfo;
    @Transform(value=>ConvertDateToFormat(new Date(value)))
    Time: string;
    DateOfBooking:string;
    SeatsRequired: number;
}