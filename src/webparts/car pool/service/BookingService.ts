import IBookingStatus from '../interface/BookingStatus';
import { injectable } from 'react-inversify';
import IBookingService from '../interface/IBookingService';
import { IBooking } from '../interface/IBooking';
import { SPHttpClient,SPHttpClientResponse,ISPHttpClientOptions} from '@microsoft/sp-http';
import { BookingEntitySet, siteURL } from '../constant/carpool';
import { SelectListInURL } from '../utilities/utilities';
import { EBookingResponseKeys } from '../enum/EBookingResponseKeys';
import { EofferingResponseKeys } from '../enum/EOfferingResponseKeys';
@injectable()
export class BookingService implements IBookingService {
   Create = (Book: IBooking, spHttpClient: SPHttpClient): IBooking => {
      const url = `${siteURL}${SelectListInURL(BookingEntitySet)}/items`;
      return axios.post(APIServer + 'booking/create', Book);
   };
   UpdateBookingStatus = (BookingStatus: IBookingStatus, spHttpClient: SPHttpClient): IBooking => {
      const url = `${siteURL}${SelectListInURL(BookingEntitySet)}/items('${BookingStatus.BookingId}')`;
      const payload: String = new String(JSON.stringify(BookingStatus));
      return axios.put(APIServer + 'booking/updatebookingstatus', payload);
   };
   //Doudt
   GetAllByUserId = (UserId: number, spHttpClient: SPHttpClient): IBooking[] => {
      const url: string = `${siteURL}${SelectListInURL(BookingEntitySet)}/items?$filter ${EBookingResponseKeys.PassengerRef} eq ${UserId}&$expand ${EBookingResponseKeys.CummuterRef}&$select=*`;

   return axios.get(APIServer+'booking/getbyUserId',{params:{userId:UserId}});
   }
   GetAllOfferedRidesBooking = (UserId: number,spHttpClient:SPHttpClient):IBooking[]=>{
      const url: string = `${siteURL}${SelectListInURL(BookingEntitySet)}/items?$expand=CommuterRef&$filter=CommuterRef/${EofferingResponseKeys.UserId} eq ${UserId}`;
      return axios.get(APIServer + 'booking/getallofferedrides', { params: { userId: UserId } });
   }
   IsUnderBooking = (Id: number, spHttpClient: SPHttpClient): boolean => {
      const url: string = `${siteURL}${SelectListInURL(BookingEntitySet)}/items('${Id}')?$select=${EBookingResponseKeys.Status}`;
      return axios.get(APIServer + 'Booking/IsUnderBooking', { params: { userId: Id } });
   }
   GetById=(BookId: number,spHttpClient:SPHttpClient) :IBooking=>{
      const url: string = `${siteURL}${SelectListInURL(BookingEntitySet)}/items('${BookId}')`;
      return axios
         .get(APIServer + 'Booking/getById', { params: { id: BookId } });
   }
}
