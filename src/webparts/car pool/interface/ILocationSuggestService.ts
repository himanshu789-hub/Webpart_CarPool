
import { ILocationInfo } from './ILocationInfo';
export default interface ILocationSuggestService
{
    GetSuggestion:(Place:string)=>ILocationInfo[];
}