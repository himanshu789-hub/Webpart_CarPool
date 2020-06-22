import { injectable } from 'react-inversify';
import { IUser } from '../interface/IUser';
import { IUserService } from '../interface/IUserService';
import { siteURL, UserEntitySet, ListNames } from '../constant/carpool';
import { SelectListInURL, ErrorStatusText } from '../utilities/utilities';
import { EUserResponseKeys } from '../enum/EUserResponseKeys';
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';
import { IUserListItem } from '../interface/IUserListItem';
import {UserListItemResponse,UserValue as UserValue} from 'UserTyping'
import { ProfileImageItem } from 'ProfileImageResponse';
@injectable()
export class UserService implements IUserService {
   
   public LogIn = (EmailId: string, Password: string, spHttpClient: SPHttpClient): Promise<IUser> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}?$select=Id,SharepointUser/Title,EMail,RoutingEnabled,Password,AttachmentFiles/FileName,AttachmentFiles/ServerRelativeUrl&$expand=AttachmentFiles&$expand=SharepointUser$filter=(${EUserResponseKeys.EMail} eq '${EmailId}') and (${EUserResponseKeys.Password} eq '${Password}')`;

      return spHttpClient.get(url, SPHttpClient.configurations.v1).then((res: SPHttpClientResponse) => {
           if (!res.ok)
               throw new Error(ErrorStatusText(res.status, res.statusText));
           return res.json();
       }).then((response):IUser => {
           const results:UserListItemResponse = response as UserListItemResponse;
           const arr = results.value;
           if (arr.length==0)
               return null;
        const user: IUser = {
            Active: arr[0][EUserResponseKeys.Active],
            Contact: arr[0][EUserResponseKeys.Contact],
            EMail: arr[0][EUserResponseKeys.EMail],
            Id: arr[0][EUserResponseKeys.Id],
            ProfileImageUrl:arr[0].AttachmentFiles[0].ServerRelativeUrl,
            Password: arr[0].Password,
            FullName:arr[0].SharepointUser.Title
            
           };
           return user;
        });
    }
    GeyUserById = (Id: number, spHttpClient: SPHttpClient): Promise<IUser> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${Id}')/?$select=Id,SharepointUserId,EMail,RoutingEnabled,Password,AttachmentFiles/FileName,AttachmentFiles/ServerRelativeUrl&$expand=AttachmentFiles`;
        return spHttpClient.get(url, SPHttpClient.configurations.v1).then((res:SPHttpClientResponse):any => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            res.json();
        }).then((response): IUser => {
            const results: UserListItemResponse = response as UserListItemResponse;
            const UserItem:UserValue = results.value[0];
            const user: IUser = {
                Active: UserItem[EUserResponseKeys.Active],
                Contact: UserItem[EUserResponseKeys.Contact],
                EMail: UserItem[EUserResponseKeys.EMail],
                Id:UserItem[EUserResponseKeys.Id],
                ProfileImageUrl:UserItem.AttachmentFiles[0].ServerRelativeUrl,
                Password:UserItem.Password,FullName:UserItem.SharepointUser.Title
            };
            return user;
        });
    }
    Delete = (Id: number, spHttpClient: SPHttpClient): Promise<boolean> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${Id}')`;

        const options: ISPHttpClientOptions = {
            method: "PATCH",
            headers: {
                "X-Htttp-Method": "MERGE"
            },
            body:
                JSON.stringify({
                    [EUserResponseKeys.Active]: false
                })
      }
        return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
                throw new Error(ErrorStatusText(res.status, res.statusText));
            if (res.status == 204||res.status == 202 || res.status==200)
                return true;
            
            return false;
      })
    }
    UpdateProfileImage(Id:number,FileName:string,file:ArrayBuffer,spHttpClient: SPHttpClient):Promise<boolean> {
        const updateAttachFileUrl: string = `${siteURL}/items('${Id}')/AttachmentFiles('${FileName}')/$value`;
        return spHttpClient.post(updateAttachFileUrl, SPHttpClient.configurations.v1, {
            body: file,
            headers: {
                "X-Http-Method": "MERGE"
            },
            method:"PATCH"
        }).then(res => {
            if (!res.ok)
                throw new Error("Error On uploading File . . .");
            if (res.status == 200 || res.status == 204)
                return true;
            return false;
        });
    }
    UploadProfileImage(Id: number, FileName: string, file: ArrayBuffer,spHttpClient:SPHttpClient): Promise<string>{
        const AttachFileUrl: string = `${siteURL}/items('${Id}')/AttachmentFiles/add(FileName='${FileName}',overwrite=true)`;
        const options: ISPHttpClientOptions = {
            body: file
        };
        return spHttpClient.post(AttachFileUrl, SPHttpClient.configurations.v1,options).then((res:SPHttpClientResponse) => {
            if (!res.ok)
                throw Error("Cannot Upload Image." + ErrorStatusText(res.status, res.statusText));
            return res.json();
        }).then(response => {
            const result: ProfileImageItem = response as ProfileImageItem; 
            return result.ServerRelativeUrl;
        });
    }
    Update = (User: IUser, spHttpClient: SPHttpClient): Promise<boolean> => {
        const url: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items('${User.Id}')`;
        const UserItem: IUserListItem = {
            CallbackNumber: User.Contact,
            EMail: User.EMail,
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
            return true;
        }); 
    }
    Create = (User: IUser,LoginId:number ,spHttpClient: SPHttpClient): Promise<IUser> => {
        const AddItemUrl: string = `${siteURL}/${SelectListInURL(UserEntitySet)}/items`;
        const UserItem: IUserListItem = {
            CallbackNumber: User.Contact,
            EMail: User.EMail,
            Password: User.Password,
            SharepointUserId: LoginId
        };
        const ActiveUser = {...UserItem,
            [EUserResponseKeys.Active]: true
        }
        
        const options: ISPHttpClientOptions = {
            body: JSON.stringify(ActiveUser),
        };
        return spHttpClient.post(AddItemUrl, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
            if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
            return res.json();    
        }).then((result): IUser => {
            const userItem: UserValue = result as UserValue;
            User.Id = userItem.ID;
            return User;
        });

    }   
    GetCurrentUserLogInId = (): Promise<number> => {
        const url: string = `${siteURL}`;
        return new Promise(() => { return 0; });
    }
}