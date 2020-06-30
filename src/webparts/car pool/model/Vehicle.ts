import { IVehicle } from "../interface/IVehicle";

export class VehicleDTO implements IVehicle{
    Id: number;
    NumberPlate: string;
    Type: string;
    Capacity: number;
    constructor() {
        this.Id = 0;
        this.NumberPlate = '';
        this.Type = '';
        this.Capacity = 0;
    }
}