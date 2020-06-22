import { IViaPointService } from "../interface/IViaPointService";
import { IViaPoint } from "../interface/IViaPoint";
import {SPHttpClient,ISPHttpClientOptions,SPHttpClientResponse } from '@microsoft/sp-http';
import { siteURL,ListNames } from "../constant/carpool";
import { SelectListInURL,  ErrorStatusText, ParseHttpResponse, MapModelToListItem } from "../utilities/utilities";
import { ViaPointItemResponse } from 'ViaPointResponse';
import { v4 as uuid } from 'uuid';
import * as AppSettings from 'AppSettings';
export class ViaPointService implements IViaPointService{
    BatchAdd(ViaPoints: IViaPoint[],spHttpClient:SPHttpClient): Promise<IViaPoint[]> {
        const url: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
        const batchUUID: string ='batch_' +uuid();
        const changeSetUUID: string ='changeset_'+ uuid();
        let batchBody: string[] = [];
        batchBody.push('--' + batchUUID);
        batchBody.push('Content-type:multipart/mixed;boundary=' + changeSetUUID)
        batchBody.push('Content-Transfer-Encoding: binary')
        batchBody.push('')
        
        for (var i = 0; i < ViaPoints.length; i++)
        {
            const endpoint: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
            batchBody.push('--' + changeSetUUID);
            batchBody.push('Content-Type:application/http');
            batchBody.push('Content-Transfer-Encoding: binary');
            batchBody.push('');
            batchBody.push('POST ' + endpoint + ' HTTP/1.1');
            batchBody.push('Content-Type:application/json');
            batchBody.push('Accept:application/json;odata=nometadata');
            batchBody.push('Authorization:Bearer ' + AppSettings.tenetAPIKey);
            batchBody.push('');
            batchBody.push(JSON.stringify(MapModelToListItem.MapViaPointToListItem(ViaPoints[i])));
            batchBody.push('');
        }
        batchBody.push('--' + changeSetUUID + '--');
        batchBody.push('--' + batchUUID + '--');
       const RequestBody:string = batchBody.join('\r\n')
        const options: ISPHttpClientOptions = {
            body: RequestBody,
            headers: {
                'Content-Type': 'multipart/mixed;boundary=batch_' + batchUUID,
                'Authorization':'Bearer '+AppSettings.tenetAPIKey
            }
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Add ViaPoints" + ErrorStatusText(res.status, res.statusText));
            return res.text();
        }).then((response):IViaPoint[] => {
            let ViaPointsId: number[] = [];
            let count: number = 0;
                
            let ResponseLIne: string[] = response.split('\n');
            for (var i = 0; i < ResponseLIne.length; i++)
            {
                if (ResponseLIne[i].substr(0, 4) == "HTTP")
                {
                    const status: number = ParseHttpResponse(ResponseLIne[i]);
                    if (status % 100 !== 2) {
                        for (var j = i; ResponseLIne[j].substr(0, 4) != "HTTP"; j++);
                        i = j - 1;
                       ViaPoints[count++].Id = 0;
                        continue;
                    }
                    else
                        continue;
                }
                try {
                    const result = JSON.parse(ResponseLIne[i]) as ViaPointItemResponse; 
                    ViaPoints[count].Id = result.Id;
                }
                catch (error) {
                    
                }
            }
            return ViaPoints;
        });
    };

    BatchDelete(ViaPointsId: number[],spHttpClient:SPHttpClient): Promise<boolean[]> {
        const url: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
        const batchUUID: string ='batch_' +uuid();
        const changeSetUUID: string ='changeset_'+ uuid();
        let batchBody: string[] = [];
        batchBody.push('--' + batchUUID);
        batchBody.push('Content-type:multipart/mixed;boundary=' + changeSetUUID)
        batchBody.push('Content-Transfer-Encoding: binary')
        batchBody.push('')
        
        for (var i = 0; i < ViaPointsId.length; i++)
        {
            const endpoint: string = `${siteURL}/${SelectListInURL(ListNames.ViaPointList)}/items`;
            batchBody.push('--' + changeSetUUID);
            batchBody.push('Content-Type:application/http');
            batchBody.push('Content-Transfer-Encoding: binary');
            batchBody.push('');
            batchBody.push(`DELETE ${endpoint}/items('${ViaPointsId[i]}') HTTP/1.1`);
            batchBody.push('Content-Type:application/json');
            batchBody.push('Accept:application/json;odata=nometadata');
            batchBody.push('Authorization:Bearer ' + AppSettings.tenetAPIKey);
            batchBody.push('If-Match:*');
            batchBody.push('');
        }
        batchBody.push('--' + changeSetUUID + '--');
        batchBody.push('--' + batchUUID + '--');
       const RequestBody:string = batchBody.join('\r\n')
        const options: ISPHttpClientOptions = {
            body: RequestBody,
            headers: {
                'Content-Type': 'multipart/mixed;boundary=batch_' + batchUUID,
                'Authorization':'Bearer '+AppSettings.tenetAPIKey
            }
        }
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error("Cannot Add ViaPoints" + ErrorStatusText(res.status, res.statusText));
            return res.text();
        }).then((response):boolean[] => {
            let ViaPointsDeleteResult: boolean[] = [];
            let count: number = 0;
                
            let ResponseLIne: string[] = response.split('\n');
            for (var i = 0; i < ResponseLIne.length; i++)
            {
                if (ResponseLIne[i].substr(0, 4) == "HTTP")
                {
                    const status: number = ParseHttpResponse(ResponseLIne[i]);
                    if (status % 100 !== 2) {
                        for (var j = i; ResponseLIne[j].substr(0, 4) != "HTTP"; j++);
                        i = j - 1;
                        ViaPointsDeleteResult[count] = false;
                        continue;
                    }
                    else
                    ViaPointsDeleteResult[count] = true;
                count++;
                }
            }
            return ViaPointsDeleteResult;
        });
    }
    
}