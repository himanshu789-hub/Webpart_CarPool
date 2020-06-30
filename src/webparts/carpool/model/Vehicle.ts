import { IVehicle } from "../interface/IVehicle";
import { Expose } from 'class-transformer';
import { EVehicleResponseKeys } from "../enum/EVehicleResponseKeys";

export class Vehicle implements IVehicle{
    @Expose({name:EVehicleResponseKeys.Id})
    Id: number;

    @Expose({name:EVehicleResponseKeys.NumberPlate})
    NumberPlate: string;

    @Expose({name:EVehicleResponseKeys.Type})
    Type: string;
    
    @Expose({name:EVehicleResponseKeys.Capacity})
    Capacity: number;
    constructor() {
        this.Id = 0;
        this.NumberPlate = '';
        this.Type = '';
        this.Capacity = 2;
    }
}