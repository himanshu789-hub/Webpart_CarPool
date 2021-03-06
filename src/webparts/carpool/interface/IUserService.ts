import { IUser } from "./IUser";
import { SPHttpClient } from '@microsoft/sp-http';

export interface IUserService {
    GeyUserById: (Id: number, spHttpClient: SPHttpClient) => Promise<IUser>;
    Delete: (Id: number, spHttpClient: SPHttpClient) => Promise<boolean>;
    Update: (User: IUser, spHttpClient: SPHttpClient) => Promise<boolean>;
    Create: (User: IUser,LogInId:number,spHttpClient: SPHttpClient) => Promise<IUser>;
    LogIn: (EmailId: string, Password: string, spHttpClient: SPHttpClient) => Promise<IUser>;
    UploadProfileImage(Id: number, FileName: string, file: ArrayBuffer, spHttpClient: SPHttpClient): Promise<string>;
    UpdateProfileImage(Id: number, FileName: string, file: ArrayBuffer, spHttpClient: SPHttpClient): Promise<boolean>;
    GetCurrentUserLogInId(spHttpClient: SPHttpClient): Promise<number>;
    IsAlreadyExists: (EmailId: string, spHttpClient: SPHttpClient) => Promise<boolean>;
}