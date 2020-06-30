import { injectable } from 'react-inversify';
import { IUser } from '../interface/IUser';
import { IUserService } from '../interface/IUserService';
import { siteURL, UserEntitySet } from '../constant/carpool';
import { SelectListInURL, ErrorStatusText } from '../utilities/utilities';
import { EUserResponseKeys } from '../enum/EUserResponseKeys';
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';
import { IUserListItem } from '../interface/IUserListItem';
import { EFileResponseKeys } from '../enum/EFileResponseKeys';

@injectable()
export class UserService implements IUserService {
   
   public LogIn = (EmailId: string, Password: string, spHttpClient: SPHttpClient): Promise<IUser> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}?$filter=(${EUserResponseKeys.EMail} eq '${EmailId}') and (${EUserResponseKeys.Password} eq '${Password}')`;

      return spHttpClient.get(url, SPHttpClient.configurations.v1).then((res: SPHttpClientResponse) => {
           if (!res.ok)
               throw new Error(ErrorStatusText(res.status, res.statusText));
           return res.json();
       }).then((response):IUser => {
           const arr = response.value;
           if (arr.length==0)
               return null;
        const user: IUser = {
               Active: arr[0][EUserResponseKeys.Active],
               Contact: arr[0][EUserResponseKeys.Contact],
               EMail: arr[0][EUserResponseKeys.EMail],
               FullName: arr[0][EUserResponseKeys.FullName],
            Id: arr[0][EUserResponseKeys.Id],
               FileName:
           };
           return user;
        });
    }
    GeyUserById = (Id: number, spHttpClient: SPHttpClient): Promise<IUser> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${Id}')`;
        return spHttpClient.get(url, SPHttpClient.configurations.v1).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            res.json();
        }).then((response): IUser => {
            const user: IUser = {
                Active: response[EUserResponseKeys.Active],
                Contact:response[EUserResponseKeys.Contact],
                EMail: response[EUserResponseKeys.EMail],
                FullName: response[EUserResponseKeys.FullName],
                Id:response[EUserResponseKeys.Id]
            };
            return user;
        });
    }
    Delete = (Id: number, spHttpClient: SPHttpClient): Promise<boolean> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${Id}')`;
        const options: ISPHttpClientOptions = {
            method: "DELETE",
            headers: {
                "X-Htttp-Method": "DELETE"
            }
      }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            if (res.status == 204||res.status == 202)
                return true;
            
            return false;
      })
    }
    UpdateProfileImage(Id:number,FileName:string,file:ArrayBuffer,spHttpClient: SPHttpClient):Promise<string> {
        const updateAttachFileUrl: string = `${siteURL}/items('${Id}')/AttachmentFiles('${FileName}')/$value`;
      return  spHttpClient.post(updateAttachFileUrl, SPHttpClient.configurations.v1, {
          body: file,
          headers: {
              "X-Http-Method":"MERGE"
          }
        }).then(res => {
            if (!res.ok)
                throw new Error("Error On uploading File . . .");
            return res.json();
        }).then(response => {
            return response[EFileResponseKeys.ServerRelativeUrl];
        });
    }
    UploadProfileImage(Id: number, FileName: string, file: ArrayBuffer,spHttpClient:SPHttpClient): Promise<string>{
        const AttachFileUrl: string = `${siteURL}/items('${Id}')/AttachmentFiles/add(FileName='${FileName}')`;
        return spHttpClient.post(AttachFileUrl, SPHttpClient.configurations.v1, {
           body:file 
        }).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw Error("Cannot Upload Image." + ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then(response => {
            return response[EFileResponseKeys.ServerRelativeUrl];
        });
    }
    Update = (User: IUser, spHttpClient: SPHttpClient): Promise<IUser> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${User.Id}')`;
        const UserItem: IUserListItem = {
            CallbackNumber: User.Contact,
            EMail: User.EMail,
            FullName: User.FullName,
            Password: User.Password
        };
        const options: ISPHttpClientOptions = {
            method: "PATCH",
            body: JSON.stringify(UserItem),
            headers: {
                "X-HTTP-METHOD": "MERGE"
            }
        };

        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
           
            return User;
        }); 
    }
    Create = (User: IUser, spHttpClient: SPHttpClient): Promise<IUser> => {
        const AddItemUrl: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items`;
        const UserItem: IUserListItem = {
            CallbackNumber: User.Contact,
            EMail: User.EMail,
            FullName: User.FullName,
            Password: User.Password
        };
        const options: ISPHttpClientOptions = {
            body: JSON.stringify(UserItem),
        };
 
        return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();    
        }).then((result): IUser => {
            User.Id = result[EUserResponseKeys.Id];
            return User;
        });
    }   
}