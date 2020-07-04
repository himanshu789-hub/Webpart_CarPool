import { IUserListItem } from "./IUserListItem";

export interface IUser {
    Id : number;
    Active : boolean;
    EMail : string;
    Password: string;
    ProfileImageUrl: string;
    FullName: string;
    FileName: string;
}