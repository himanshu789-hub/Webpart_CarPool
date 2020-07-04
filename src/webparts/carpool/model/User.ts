import { IUser } from "../interface/IUser";
import { IUserListItem } from "../interface/IUserListItem";

export class User implements IUser{
  Id: number;
  Active: boolean;
  EMail: string;
  FullName: string;
  constructor() {
    this.Id = 0;
    this.Active = true;
    this.EMail = '';
    this.FullName = '';
    this.Password = '';
    this.FileName = '';
}
  ProfileImageUrl: string;
  Password: string;
  FileName: string;
}