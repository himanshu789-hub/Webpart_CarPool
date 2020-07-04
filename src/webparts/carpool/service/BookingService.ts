import IBookingStatus from '../interface/BookingStatus';
import { injectable } from 'react-inversify';
import { IBookingService } from '../interface/IBookingService';
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';
import { BookingEntitySet, siteURL, BookingStatus, ELocationType, ListNames } from '../constant/carpool';
import { SelectListInURL, MapModelToListItem, ErrorStatusText } from '../utilities/utilities';
import { EBookingResponseKeys } from '../enum/EBookingResponseKeys';
import { IBookingListItem } from '../interface/IBookingListItem';
import { BookingResponseValue, BookingResponseListItem } from 'BookingResponse';
import { IBooking } from '../interface/IBooking';
import { plainToClass } from 'class-transformer';
import { Booking } from '../model/Booking';
import * as AppSettings from 'AppSettings';
import { FilterResponseItems } from 'FilterResponse';
import { BookingCountResponse } from 'BookingCountResponse';

@injectable()
export class BookingService implements IBookingService {
   GetAllCompleted = (OfferId: number, Destination: string, spHttpClient: SPHttpClient): Promise<number[]> => {
      const url: string = `${siteURL}/${SelectListInURL(ListNames.BookingList)}/items?$select=Id&$filter=(${EBookingResponseKeys.CummuterRef} eq '${OfferId}') and (${EBookingResponseKeys.Destination} eq '${Destination}') and (${EBookingResponseKeys.Status} eq '${BookingStatus.ACCEPTED}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };

      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
         if (!res.ok)
            throw new Error('Cannot Fetch Competed Booking');
         return res.json();
      }).then(response => {
         const results = response as FilterResponseItems;
         const values = results.value;
         return [...values.map(e => e.ID)];
      });
   }
  GetIdOfBookingNotAcceptedUntillReachedLocationByOfferId = (OfferId: number, ReachedLocation: string, spHttpClient: SPHttpClient) : Promise<number[]>=>{
      const url: string = `${siteURL}/${SelectListInURL(ListNames.BookingList)}/items?$select=Id&$filter=(${EBookingResponseKeys.CummuterRef} eq '${OfferId}') and (${EBookingResponseKeys.Status} eq '${BookingStatus.REQUESTED}') and (${EBookingResponseKeys.Status} eq '${BookingStatus.REQUESTED}') and ((${EBookingResponseKeys.Source} eq '${ReachedLocation}') or (${EBookingResponseKeys.Destination} eq '${ReachedLocation}'))`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };

      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
         if (!res.ok)
            throw new Error('Cannot Fetch Resource.'+ErrorStatusText(res.status,res.statusText));
         return res.json();
      }).then(response => {
         const results = response as FilterResponseItems;
         const values = [...results.value.map(e=>e.Id)];
         return values;
      });
   }
   Create = (Book:IBooking, spHttpClient: SPHttpClient): Promise<IBooking> => {
      const url = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items`;
      const NewBooking: IBookingListItem = MapModelToListItem.MapBookingToListItem(Book);
      const options: ISPHttpClientOptions = {
         body: JSON.stringify(NewBooking),
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      }
       
      return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error("Cannot Create Booking Item.\n" + ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then(response => {
         const result: BookingResponseValue = response as BookingResponseValue;
         
         return { ...Book, Id: result.ID };
      });
   }

   UpdateBookingStatus = (BookingStatus: IBookingStatus, spHttpClient: SPHttpClient): Promise<boolean> => {
      const url = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items(${BookingStatus.BookingId})`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json;odata=nometadata',
            'X-HTTP-METHOD': 'MERGE',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0',
            'If-Match': '*'
         },
         body: JSON.stringify({
            [EBookingResponseKeys.Status]: BookingStatus.BookingStatus
         }),
         method: "PATCH"
      };
      return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error('Cannot Update Booking Status.' + ErrorStatusText(res.status, res.statusText));
         return true;
      });
   }

   GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): Promise<IBooking[]> => {
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace,${EBookingResponseKeys.DateOfBooking},${EBookingResponseKeys.DestinationCoords},${EBookingResponseKeys.SourceCoords},${EBookingResponseKeys.SeatsRequired},Time&$filter=(${EBookingResponseKeys.PassengerRef} eq '${UserId}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((res): IBooking[] => {
         const result: BookingResponseListItem = res as BookingResponseListItem;
         const values: BookingResponseValue[] = result.value;
         let Bookings: IBooking[] = [];
         values.map(e => Bookings.push(plainToClass(Booking, e, { excludeExtraneousValues: true })));
         return Bookings;
      });
   
   }
   GetAllOfferedRidesBooking = (OfferIds: number[], spHttpClient: SPHttpClient): Promise<IBooking[]> => {
      let valuesArr: string = '';
      for (let i = 0; i < OfferIds.length; i++) {
         if (i == OfferIds.length - 1)
            valuesArr += `(CommuterRefId eq '${OfferIds[i]}')`;
         else
            valuesArr += `(CommuterRefId eq '${OfferIds[i]}') or `;
      }
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,SourceCoords,DestinationCoords,DestinationPlace,OData__DCDateCreated,${EBookingResponseKeys.SeatsRequired}&$filter=${valuesArr}`;
     
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };
            
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((res): IBooking[] => {
         const result: BookingResponseListItem = res as BookingResponseListItem;
         const values: BookingResponseValue[] = result.value;
         let Bookings: IBooking[] = [];
         debugger;
         values.map(e => Bookings.push(plainToClass(Booking, e, { excludeExtraneousValues: true })));
         return Bookings;
      });
   };

   IsUnderBooking = (Id: number, spHttpClient: SPHttpClient): Promise<number> => {
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?select=Id&$filter=((${EBookingResponseKeys.Status} eq '${BookingStatus.REQUESTED}') or (${EBookingResponseKeys.Status} eq '${BookingStatus.ACCEPTED}')) and (${EBookingResponseKeys.PassengerRef} eq '${Id}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };
      
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((response): number => {
         const result: BookingResponseListItem = response as BookingResponseListItem;
         if (!result.value.length)
            return null;
         return result.value[0].Id;
      });
   };
   GetCountByLocation = (OfferId:number,Location: string, LocationType: number, spHttpClient: SPHttpClient): Promise<number> => {
      const filterColumn: string = (LocationType == ELocationType.SOURCE) ? EBookingResponseKeys.Source : EBookingResponseKeys.Destination;
      const url: string = `${siteURL}/${SelectListInURL(ListNames.BookingList)}/items?$select=Id,${EBookingResponseKeys.SeatsRequired}&$filter=(${EBookingResponseKeys.CummuterRef} eq '${OfferId}') and ((${EBookingResponseKeys.Status} eq '${BookingStatus.ACCEPTED}') or (${EBookingResponseKeys.Status} eq '${BookingStatus.COMPLETED}')) and (${filterColumn} eq '${Location}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version': '3.0'
         }
      };
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then(res => {
         if (!res.ok)
            throw new Error('Cannot Get Booking Count.' + ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then(response => {
         const results:BookingCountResponse = response as BookingCountResponse;
         let count: number = 0;
         results.value.map(e => count += e.SeatsRequired);
         return count;
      });
   }
   GetById=(BookId: number,spHttpClient:SPHttpClient) :Promise<IBooking>=>{
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items('${BookId}')?$select=Id,SourceCoords,DestinationCoords,Time,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace,OData__DCDateCreated,${EBookingResponseKeys.SeatsRequired}`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization':'Bearer '+AppSettings.tenantAPIKey,
            'odata-version':'3.0'
        
         }
      };
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((res):IBooking=> {
         const value: BookingResponseValue = res as BookingResponseValue ;
         const Book: IBooking = plainToClass(Booking, value,{ excludeExtraneousValues: true });
         return Book;
      }); 
   }
}
