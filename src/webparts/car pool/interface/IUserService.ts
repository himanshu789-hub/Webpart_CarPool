import { IUser } from "./IUser";
import { SPHttpClient } from '@microsoft/sp-http';

export interface IUserService {
    GeyUserById: (Id: number, spHttpClient: SPHttpClient) => Promise<IUser>;
    Delete: (Id: number, spHttpClient: SPHttpClient) => Promise<boolean>;
    Update: (User: IUser, spHttpClient: SPHttpClient) => Promise<IUser>;
    Create: (User: IUser, spHttpClient: SPHttpClient) => Promise<IUser>;
    LogIn: (EmailId: string, Password: string, spHttpClient: SPHttpClient) => Promise<IUser>;
    UploadProfileImage(Id: number, FileName: string, file: ArrayBuffer, spHttpClient: SPHttpClient): Promise<string>;
    UpdateProfileImage(Id: number, FileName: string, file: ArrayBuffer, spHttpClient: SPHttpClient): Promise<string>;
}