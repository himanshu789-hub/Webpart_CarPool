import { IOffering } from './../interface/IOffering';
import { IVehicle } from './../interface/IVehicle';
export class Offering implements IOffering {
    Id: number;
    Destination: string;
    Discount: number;
    Source: string;
    DistanceFromLastPlace: string;
    UserId: number;
    PricePerKM: number;
    SeatsOffered: number;
    TotalEarn: number;
    VehicleId:IVehicle;
    ViaPointIds: number[];
    Active: boolean;
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
        this.ViaPointIds = [];
    }

}