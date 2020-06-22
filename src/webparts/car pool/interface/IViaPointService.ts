import { IViaPoint } from "./IViaPoint";
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';

export interface IViaPointService{
    BatchAdd(ViaPoints: IViaPoint[],spHttpClient:SPHttpClient): Promise<IViaPoint[]>;
    BatchDelete(ViaPointsId: number[], spHttpClient: SPHttpClient): Promise<boolean[]>;
}