import { IUser } from "../interface/IUser";

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
  Password: string;
  FileName: string;
}