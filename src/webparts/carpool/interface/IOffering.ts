import { IViaPoint } from './IViaPoint';
import { ICoordinateInfo } from './ICoordinateInfo';

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
    StartTime: string;
    Time: string;
    SourceCoords: ICoordinateInfo;
    DestinationCoords: ICoordinateInfo;
    getNextLocation(): string;
}
