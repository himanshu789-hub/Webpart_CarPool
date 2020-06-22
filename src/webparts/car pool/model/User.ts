import { IUser } from "../interface/IUser";
import { IUserListItem } from "../interface/IUserListItem";

export class User implements IUser{
  Id: number;
  Active: boolean;
  Contact: string;
  EMail: string;
  FullName: string;
  constructor() {
    this.Id = 0;
    this.Active = true;
    this.Contact = '';
    this.EMail = '';
    this.FullName = '';
    this.Password = '';
    this.FileName = '';
}
  ProfileImageUrl: string;
  Password: string;
  FileName: string;
}