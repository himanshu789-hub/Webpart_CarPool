import { EUserResponseKeys } from "../enum/EUserResponseKeys";

export interface IUserListItem{
    [EUserResponseKeys.Contact]: string;
    [EUserResponseKeys.EMail]: string;
    [EUserResponseKeys.FullName]: string;
    [EUserResponseKeys.Password]: string;
}