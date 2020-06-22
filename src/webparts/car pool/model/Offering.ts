import { IOffering } from './../interface/IOffering';
import { IVehicle } from './../interface/IVehicle';
import {Expose,Type } from 'class-transformer';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
import { IViaPoint } from '../interface/IViaPoint';
import {ViaPoint } from './ViaPoint';

export class Offering implements IOffering {
    Id: number;
    @Expose({name:EofferingResponseKeys.Destination})
    Destination: string;
    
    @Expose({name:EofferingResponseKeys.Discount})
    Discount: number;
    
    @Expose({name:EofferingResponseKeys.Source})
    Source: string;
    
    @Expose({name:EofferingResponseKeys.DistanceFromLastPlace})
    DistanceFromLastPlace: number;
    
    @Expose({name:EofferingResponseKeys.UserId})
    UserId: number;
    
    @Expose({name:EofferingResponseKeys.PricePerKM})
    PricePerKM: number;
    
    @Expose({name:EofferingResponseKeys.SeatsOffered})
    SeatsOffered: number;
    @Expose({name:EofferingResponseKeys.TotalEarn})
    TotalEarn: number;
    @Expose({name:EofferingResponseKeys.VehicleId})
    VehicleId:number;
    @Expose({ name: EofferingResponseKeys.ViaPointIds })
    @Type(()=>ViaPoint)
    ViaPoints: IViaPoint[];
    @Expose({ name: EofferingResponseKeys.Active}) 
    Active: boolean;
    StartTime: Date;
    constructor() {
        this.Id = 0;
        this.Destination = '';
        this.Discount = 0;
        this.DistanceFromLastPlace = null;
        this.PricePerKM = null;
        this.SeatsOffered = null;
        this.Source = '';
        this.TotalEarn = 0;
        this.UserId = null;
        this.VehicleId = null;
        this.ViaPoints = [];
    }
    getNextLocation(): string {
        throw new Error("Method not implemented.");
    }
    @Expose()
    ReachedLocation: string;

}