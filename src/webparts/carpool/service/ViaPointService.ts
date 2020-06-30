import { IViaPointService } from "../interface/IViaPointService";
import { IViaPoint } from "../interface/IViaPoint";
import {SPHttpClient,ISPHttpClientOptions,SPHttpClientResponse } from '@microsoft/sp-http';
import { siteURL,ListNames } from "../constant/carpool";
import { SelectListInURL,  ErrorStatusText, ParseHttpResponse, MapModelToListItem } from "../utilities/utilities";
import { ViaPointItemResponse } from 'ViaPointResponse';
import { v4 as uuid } from 'uuid';
import * as AppSettings from 'AppSettings';
import { injectable } from "react-inversify";
@injectable()
export class ViaPointService implements IViaPointService{
    BatchAdd(ViaPoints: IViaPoint[],spHttpClient:SPHttpClient): Promise<IViaPoint[]> {
        const url: string = `${siteURL}/_api/$batch`;
        debugger;
        const batchUUID: string ='batch_' +uuid();
        const changeSetUUID: string ='changeset_'+ uuid();
        let batchBody: string[] = [];
        batchBody.push('--' + batchUUID);
        batchBody.push('Content-type:multipart/mixed;boundary="' + changeSetUUID+'"')
        batchBody.push('Content-Transfer-Encoding: binary')
        batchBody.push('')
        
        for (var i = 0; i < ViaPoints.length; i++)
        {
            const endpoint: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
            batchBody.push('--' + changeSetUUID);
            batchBody.push('Content-Type:application/http');
            batchBody.push('Content-Transfer-Encoding: binary');
            batchBody.push('Content-ID:' + (i + 1));
            batchBody.push('');
            batchBody.push('POST ' + endpoint + ' HTTP/1.1');
            batchBody.push('Content-Type:application/json');
            batchBody.push('Accept:application/json');
            batchBody.push('Authorization:Bearer ' + AppSettings.tenantAPIKey);
            batchBody.push('');
            batchBody.push(JSON.stringify(MapModelToListItem.MapViaPointToListItem(ViaPoints[i])));
            batchBody.push('');
        }
        batchBody.push('--' + changeSetUUID + '--');
        batchBody.push('--' + batchUUID + '--');
        const RequestBody: string = batchBody.join('\r\n');
        const options: ISPHttpClientOptions = {
            body: RequestBody,
            headers: {
                'Content-Type': 'multipart/mixed;boundary="' + batchUUID+'"',
                'Authorization': 'Bearer ' + AppSettings.tenantAPIKey
            }
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Add ViaPoints" + ErrorStatusText(res.status, res.statusText));
            return res.text();
        }).then((response): IViaPoint[] => {
            debugger;
            let count: number = 0;
                
            let ResponseLIne:string[] = response.split('\r\n');
            for (var i = 0; i < ResponseLIne.length; i++)
            {
                if (ResponseLIne[i].substr(0, 4) == "HTTP")
                {
                    let str :String = ResponseLIne[i];
                    
                    if (!(str.includes("201")||str.includes("202")||str.includes("203")||str.includes("204"))) {
                        for (var j = i; ResponseLIne[j].substr(0, 4) != "HTTP" &&j<ResponseLIne.length; j++);
                        i = j - 1;
                       ViaPoints[count++].Id = 0;
                        continue;
                    }
                    else
                        continue;
                }
                try {
                    const result = JSON.parse(ResponseLIne[i]) as ViaPointItemResponse; 
                    debugger;
                    ViaPoints[count++].Id = result.Id;
                }
                catch (error) {
                    
                }
            }
            return ViaPoints;
        });
    };

    BatchDelete(ViaPointsId: number[],spHttpClient:SPHttpClient): Promise<boolean[]> {
        const url: string = `${siteURL}/_api/$batch`;
        const batchUUID: string ='batch_' +uuid();
        const changeSetUUID: string ='changeset_'+ uuid();
        let batchBody: string[] = [];
        batchBody.push('--' + batchUUID);
        batchBody.push('Content-Type:multipart/mixed;boundary="' + changeSetUUID+'"')
        batchBody.push('Content-Transfer-Encoding: binary');
        batchBody.push('');
        
        for (var i = 0; i < ViaPointsId.length; i++)
        {
            const endpoint: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
            batchBody.push('--' + changeSetUUID);
            batchBody.push('Content-Type:application/http');
            batchBody.push('Content-Transfer-Encoding: binary');
            batchBody.push('Content-ID:' + (i + 1));
            batchBody.push('');
            batchBody.push(`DELETE ${endpoint}('${ViaPointsId[i]}') HTTP/1.1`);
            batchBody.push('Content-Type:application/json');
            batchBody.push('Accept:application/json');
            batchBody.push('Authorization:Bearer ' + AppSettings.tenantAPIKey);
            batchBody.push('If-Match:*');
            batchBody.push('');
        }
        batchBody.push('--' + changeSetUUID + '--');
        batchBody.push('--' + batchUUID + '--');
       const RequestBody:string = batchBody.join('\r\n')
        const options: ISPHttpClientOptions = {
            body: RequestBody,
            headers: {
                'Content-Type': 'multipart/mixed;boundary="' + batchUUID+'"',
                'Authorization':'Bearer '+AppSettings.tenantAPIKey
            }
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Delete ViaPoints" + ErrorStatusText(res.status, res.statusText));
            return res.text();
        }).then((response):boolean[] => {
            let ViaPointsDeleteResult: boolean[] = new Array<boolean>(ViaPointsId.length);
            let count: number = 0;
            debugger;
            let ResponseLIne: string[] = response.split('\r\n');
            for (var i = 0; i < ResponseLIne.length; i++)
            {
                if (ResponseLIne[i].substr(0, 4) == "HTTP")
                {
                    let str:String = ResponseLIne[i];
                  
                    if (!(str.includes("201")||str.includes("202")||str.includes("203")||str.includes("204"))) {
                        for (var j = i; ResponseLIne[j].substr(0, 4) != "HTTP"; j++);
                        i = j - 1;
                        ViaPointsDeleteResult[count++] = false;
                    }
                    else
                    ViaPointsDeleteResult[count++] = true;
                }
            }
            return ViaPointsDeleteResult;
        });
    }
    
}