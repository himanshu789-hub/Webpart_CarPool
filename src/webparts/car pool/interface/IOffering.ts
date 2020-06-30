import {IVehicle} from './IVehicle';
export interface IOffering{
	Id: number,
    Destination : string,
    Discount : number,
    Source : string,
    DistanceFromLastPlace : number,
    UserId : number,
    PricePerKM : number,
    SeatsOffered : number,
    TotalEarn:number,
    VehicleId : IVehicle,
    ViaPointIds : string[],//to see
    Active:boolean
}
