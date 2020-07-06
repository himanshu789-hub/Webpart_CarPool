import { IOffering } from './../interface/IOffering';
import {Expose,Type, Transform } from 'class-transformer';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
import { IViaPoint } from '../interface/IViaPoint';
import { ViaPoint } from './ViaPoint';
import { ConvertDateToFormat, ParseCoordinate } from '../utilities/utilities';
import { ICoordinateInfo } from '../interface/ICoordinateInfo';

export class Offering implements IOffering {
    @Expose({ name: EofferingResponseKeys.Id })
    Id: number;
    @Expose({ name: EofferingResponseKeys.Destination })
    Destination: string;
    
    @Expose({ name: EofferingResponseKeys.Discount })
    @Transform(value => value)
    Discount: number;
    
    @Expose({ name: EofferingResponseKeys.Source })
    Source: string;
    
    @Expose({ name: EofferingResponseKeys.DistanceFromLastPlace })
    DistanceFromLastPlace: number;
    
    @Expose({ name: EofferingResponseKeys.UserId })
    UserId: number;
    
    @Expose({ name: EofferingResponseKeys.PricePerKM })
    PricePerKM: number;
    
    @Expose({ name: EofferingResponseKeys.SeatsOffered })
    SeatsOffered: number;
    @Expose({ name: EofferingResponseKeys.TotalEarn })
    TotalEarn: number;
    @Expose({ name: EofferingResponseKeys.VehicleId })
    VehicleId: number;
    @Expose({ name: EofferingResponseKeys.ViaPointRefsField })
    @Type(() => ViaPoint)
    ViaPoints: IViaPoint[];
    @Expose({ name: EofferingResponseKeys.Active })
    Active: boolean;
    @Expose({ name: EofferingResponseKeys.Date })
    @Transform(value => ConvertDateToFormat(value))
    StartTime: string;
    constructor() {
        this.Id = 0;
        this.Destination = '';
        this.Discount = 0;
        this.DistanceFromLastPlace = 0;
        this.PricePerKM = 0;
        this.SeatsOffered = 0;
        this.Source = '';
        this.TotalEarn = 0;
        this.UserId = null;
        this.VehicleId = null;
        this.ViaPoints = [];
        this.ViaPoints.push({ DistanceFromLastPlace: 0, Id: 0, Place: '', Coords: { Lattitude: '', Longitude: '' } });
        this.Time = null,
            this.StartTime = null;
        this.ReachedLocation = null;
        this.IsRideStarted = false;
        this.getNextLocation = this.getNextLocation;
    }

    @Expose({ name: EofferingResponseKeys.IsRideStarted })
    IsRideStarted: boolean;
    @Expose({ name: EofferingResponseKeys.SourceCoords })
    @Transform(value => ParseCoordinate(value))
    SourceCoords: ICoordinateInfo;
    @Expose({ name: EofferingResponseKeys.DestinationCoords })
    @Transform(value => ParseCoordinate(value))
    DestinationCoords: ICoordinateInfo;

    getNextLocation(): string {
        debugger;
        if (!this.ReachedLocation)
            return this.ViaPoints[0].Place;
        const route: Array<string> = [this.Source, ...this.ViaPoints.map(e => e.Place), this.Destination];
        const index = route.indexOf(this.ReachedLocation)
        const nextIndex = index + 1;
        if (nextIndex == route.length)
            null;
        else
          return route[nextIndex];
    }
    @Expose({name: EofferingResponseKeys.ReachedLocation})
    ReachedLocation: string;
    @Expose({name:EofferingResponseKeys.Time})
    Time: string;

}