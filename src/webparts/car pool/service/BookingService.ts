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
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
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
            'X-HTTP-METHOD':'MERGE',
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
        
         },
         method:"PATCH",
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
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$filter ${EBookingResponseKeys.PassengerRef} eq ${UserId}&$expand ${EBookingResponseKeys.CummuterRef}&$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
        
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
         values.map(e => Bookings.push(plainToClass(Booking, e)));
         return Bookings;
      });
   
   }
   GetAllOfferedRidesBooking = (UserId: number,spHttpClient:SPHttpClient):Promise<IBooking[]>=>{
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items?$expand=CommuterRef&$filter=CommuterRef/${EofferingResponseKeys.UserId} eq ${UserId}`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
        
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
         values.map(e => Bookings.push(plainToClass(Booking, e)));
         return Bookings;
      });
   }

   IsUnderBooking = (Id: number, spHttpClient: SPHttpClient): Promise<boolean> => {
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items('${Id}')?$select=${EBookingResponseKeys.Status}`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
        
         }
      };
      
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((response):boolean => {
         const result:BookingResponseValue = response as BookingResponseValue;
         return result.BookingStatus == BookingStatus.ACCEPTED;
      })
   }
   GetById=(BookId: number,spHttpClient:SPHttpClient) :Promise<IBooking>=>{
      const url: string = `${siteURL}/${SelectListInURL(BookingEntitySet)}/items('${BookId}')?$select=Id,BookingStatus,CommuterRefId,FarePrice,SourcePlace,TakerRefId,DestinationPlace`;
      const options: ISPHttpClientOptions = {
         headers: {
            'Accept': 'application/json;odata=nometadata',
            'Authorization':'Bearer '+AppSettings.tenetAPIKey
        
         }
      };
      return spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((res: SPHttpClientResponse) => {
         if (!res.ok)
            throw new Error(ErrorStatusText(res.status, res.statusText));
         return res.json();
      }).then((res):IBooking=> {
         const value: BookingResponseValue = res as BookingResponseValue ;
         const Book: IBooking = plainToClass(Booking, value);
         return Book;
      }); 
   }
}
