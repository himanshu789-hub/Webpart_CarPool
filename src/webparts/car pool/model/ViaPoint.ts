import { IViaPoint } from "../interface/IViaPoint";

export class ViaPoint implements IViaPoint
{
    DistanceFromLastPlace: number;
    Place: string;
    Id: number;
}