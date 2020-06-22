import { IUserListItem } from "./IUserListItem";

export interface IUser {
    Id : number;
    Active : boolean;
    Contact : string;
    EMail : string;
    Password: string;
    ProfileImageUrl: string;
    FullName: string;
}