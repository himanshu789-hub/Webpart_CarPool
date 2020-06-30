import { EVehicleResponseKeys } from "../enum/EVehicleResponseKeys";

export interface IVehicleListItem{
    [EVehicleResponseKeys.Capacity]: number;
    [EVehicleResponseKeys.NumberPlate]: string;
    [EVehicleResponseKeys.Type]: string;
}