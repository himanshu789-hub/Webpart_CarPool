import { EUserResponseKeys } from "../enum/EUserResponseKeys";

export interface IUserListItem{
    [EUserResponseKeys.Contact]: string;
    [EUserResponseKeys.EMail]: string;
    [EUserResponseKeys.Password]: string;
    [EUserResponseKeys.SharepointUserId]?: number;
}