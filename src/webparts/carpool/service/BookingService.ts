import IBookingStatus from '../interface/BookingStatus';
import { injectable } from 'react-inversify';
import { IBookingService } from '../interface/IBookingService';
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';
import { BookingEntitySet, siteURL, BookingStatus } from '../constant/carpool';
import { SelectListInURL, MapModelToListItem, ErrorStatusText } from '../utilities/utilities';
import { EBookingResponseKeys } from '../enum/EBookingResponseKeys';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
import { IBookingListItem } from '../interface/IBookingListItem';
import { BookingResponseValue, BookingResponseListItem } from 'BookingResponse';
import { IBooking } from '../interface/IBooking';
import { plainToClass } from 'class-transformer';
import { Booking } from '../model/Booking';
import * as AppSettings from 'AppSettings';

@injectable()
export class BookingService implements IBookingService {
   Create = (Book:IBooking, spHttpClient: SPHttpClient): Promise<IBooking> => {
      const url = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items`;
      const NewBooking: IBookingListItem = MapModelToListItem.MapBookingToListItem(Book);
      const options: ISPHttpClientOptions = {
         body: JSON.stringify(NewBooking),
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version':'3.0'
         }
      }
       
      return spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error("Cannot Create Booking Item." + ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then(response => {
         const result: BookingResponseValue = response as BookingResponseValue;
         
         return { ...Book, Id: result.ID };
      });
   };

   UpdateBookingStatus = (BookingStatus: IBookingStatus, spHttpClient: SPHttpClient): Promise<boolean> => {
      const url = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items('${BookingStatus.BookingId}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json;odata=nometadata',
            'X-HTTP-METHOD':'PATCH',
            'Authorization':'Bearer '+AppSettings.tenantAPIKey,
            'odata-version':'3.0'        
         },
         body: JSON.stringify({
            [EBookingResponseKeys.Status]:BookingStatus.BookingStatus
         })
      }
      return spHttpClient.fetch(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error('Cannot Update Booking Status.' + ErrorStatusText(res.status, res.statusText));
         return true;
      });
   };

   GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): Promise<IBooking[]> => {
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$filter ${EBookingResponseKeys.PassengerRef} eq ${UserId}&$expand CommuterRef&$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace`;
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
      }).then((res):IBooking[]=> {
         const result: BookingResponseListItem = res as BookingResponseListItem;
         const values: BookingResponseValue[] = result.value;
         let Bookings: IBooking[] = [];
         values.map(e => Bookings.push(plainToClass(Booking, e,{ excludeExtraneousValues: true })));
         return Bookings;
      });
   
   }
   GetAllOfferedRidesBooking = (OfferIds: number[],spHttpClient:SPHttpClient):Promise<IBooking[]>=>{
      let valuesArr: string = '';
      for (let i = 0; i < OfferIds.length; i++){
         if (i == OfferIds.length - 1)
            valuesArr += `(CommuterRefId eq '${OfferIds[i]}')`;
         else
         valuesArr += `(CommuterRefId eq '${OfferIds[i]}') or `;
      }
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,SourceCoords,DestinationCoord,DestinationPlace&filter=${valuesArr}`;
     
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
      }).then((res):IBooking[]=> {
         const result: BookingResponseListItem = res as BookingResponseListItem;
         const values: BookingResponseValue[] = result.value;
         let Bookings: IBooking[] = [];
         debugger;
         values.map(e => Bookings.push(plainToClass(Booking, e,{ excludeExtraneousValues: true })));
         return Bookings;
      });
   }

   IsUnderBooking = (Id: number, spHttpClient: SPHttpClient): Promise<boolean> => {
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$filter=(${EBookingResponseKeys.Status} eq '${BookingStatus.NOTREQUESTED}') and (${EBookingResponseKeys.PassengerRef} eq '${Id}')`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization': 'Bearer ' + AppSettings.tenantAPIKey,
            'odata-version':'3.0'
         }
      };
      
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((response): boolean => {
         const result: BookingResponseListItem = response as BookingResponseListItem;
         return result.value.length == 0;
      });
   }
   GetById=(BookId: number,spHttpClient:SPHttpClient) :Promise<IBooking>=>{
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items('${BookId}')?$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace`;
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
