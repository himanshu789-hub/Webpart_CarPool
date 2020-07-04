import { EUserResponseKeys } from "../enum/EUserResponseKeys";

export interface IUserListItem{
    [EUserResponseKeys.EMail]: string;
    [EUserResponseKeys.Password]: string;
    [EUserResponseKeys.SharepointUserId]?: number;
}