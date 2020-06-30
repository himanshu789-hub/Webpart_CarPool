
import { ILocationInfo } from './ILocationInfo';

export  interface ILocationSuggestService
{
    GetSuggestion:(Place:string)=>Promise<ILocationInfo[]>;
}