import { IVehicle } from "../interface/IVehicle";
import { Expose } from 'class-transformer';
import { EVehicleResponseKeys } from "../enum/EVehicleResponseKeys";

export class Vehicle implements IVehicle{
    Id: number;
    NumberPlate: string;
    @Expose({name:EVehicleResponseKeys.Type})
    Type: string;
    Capacity: number;
    constructor() {
        this.Id = 0;
        this.NumberPlate = '';
        this.Type = '';
        this.Capacity = 0;
    }
}