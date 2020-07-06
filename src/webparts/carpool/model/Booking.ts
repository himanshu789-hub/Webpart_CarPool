import { IBooking } from "../interface/IBooking";
import { BookingStatus } from "../constant/carpool";
import { Expose, Transform } from 'class-transformer';
import { EBookingResponseKeys } from "../enum/EBookingResponseKeys";
import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { ParseCoordinate, ConvertDateToFormat } from "../utilities/utilities";

export class Booking implements IBooking{
    @Expose({name:EBookingResponseKeys.Id})
    Id: number;
    
    @Expose({ name: EBookingResponseKeys.Status })
    Status: string;
    @Expose({name:EBookingResponseKeys.CummuterRef})
    CummuterRef: number;
    
    @Expose({name:EBookingResponseKeys.Destination})
    Destination: string;
    
    @Expose({name:EBookingResponseKeys.FarePrice})
    FarePrice: number;

    @Expose({name:EBookingResponseKeys.Source})
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
        this.SeatsRequired = null;
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

    @Expose({name:EBookingResponseKeys.Time})
    Time: string;
  
    @Expose({ name: EBookingResponseKeys.DateOfBooking })
    @Transform(value => ConvertDateToFormat(value))
    DateOfBooking: string;
 
    @Expose({ name: EBookingResponseKeys.SeatsRequired })
    SeatsRequired: number;
}