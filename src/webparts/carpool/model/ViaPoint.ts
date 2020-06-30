import { IViaPoint } from "../interface/IViaPoint";
import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { Expose, Transform } from "class-transformer";
import { EViaPointResponseKeys } from "../enum/EViaPointResponseKeys";
import { ParseCoordinate } from "../utilities/utilities";

export class ViaPoint implements IViaPoint
{
    @Expose({ name: EViaPointResponseKeys.Coords })
    @Transform(value => ParseCoordinate(value))
    Coords: ICoordinateInfo;
    @Expose({name:EViaPointResponseKeys.DistanceFromLastPlace})
    DistanceFromLastPlace: number;
    @Expose({name:EViaPointResponseKeys.Place})
    Place: string;
    @Expose({ name:EViaPointResponseKeys.Id})
    Id: number;

    constructor() {
        this.Coords = { Longitude: '', Lattitude: '' };
        this.DistanceFromLastPlace = 0;
        this.Place = '';
        this.Id = 0;
    }
}