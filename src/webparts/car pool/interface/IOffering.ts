import { IViaPoint } from './IViaPoint';

export interface IOffering{
    Id: number,
    Destination: string,
    Discount : number,
    Source : string,
    DistanceFromLastPlace : number,
    UserId : number,
    PricePerKM : number,
    SeatsOffered : number,
    TotalEarn:number,
    VehicleId : number,
    ViaPoints : IViaPoint[],//to see
    Active: boolean;
    ReachedLocation: string;
    StartTime: Date;

    getNextLocation(): string;
}
