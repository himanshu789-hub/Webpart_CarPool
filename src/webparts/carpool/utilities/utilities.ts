import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { IUserListItem } from "../interface/IUserListItem";
import { IUser } from "../interface/IUser";
import { IViaPointListItem } from './../interface/IViaPointLisItem';
import { IViaPoint } from "../interface/IViaPoint";
import { IOffering } from "../interface/IOffering";
import { IOfferListItem } from "../interface/IOfferListItem";
import { IBooking } from "../interface/IBooking";
import { IBookingListItem } from "../interface/IBookingListItem";
import { IVehicle } from "../interface/IVehicle";
import { IVehicleListItem } from "../interface/IvehicleListItem";
import { RouteInfoValue } from "RouteInfo";
import { IOfferRouteAndSeatInfo } from "../interface/IOfferRouteAndSeatInfo";


export function StringifyCoordinate(coords: ICoordinateInfo):string {
  return `${coords.Lattitude},${coords.Longitude}`;
}
export function ConvertToFormatForSPURL(date: string) {
  const dateArr = date.split('/');
  return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
}
// Coordinate String Format `lattitude,Longitude`
export function ParseCoordinate(str: string):ICoordinateInfo {
  const arr = str.split(',');
  const longitude = arr.pop();
  const latitude = arr.pop();
  return {Lattitude:latitude,Longitude:longitude}
}
export function SelectListInURL(listName: string) {
  return `_api/web/lists/getbytitle('${listName}')`;
}

export function ErrorStatusText(statusCode:number, statusText:string):string {
  return `Sever responded with status code '${statusCode}(${statusText})`;
}
export function ValidateDate(inputDate:Date) {
  const currDate: Date = new Date();
  return inputDate >= currDate;
}

export function CoonvertStringDateToObject(date: string): Date{
  const dateArr: Array<string> = date.split('/');
  const itemDate: Date = new Date(parseInt(dateArr[2]), parseInt(dateArr[1]), parseInt(dateArr[0]));
  return itemDate;
}
export function ParseHttpResponse(response: string): number{
  const responseValue: string[] = response.split(" ");
  return parseInt(responseValue[1]);
}
 
export  function IsElmentsInArrayDiscerte(arr: Array<string>){
  let counts = {};

  for(var i = 0; i < arr.length; i++) {
   
      if(counts[arr[i]] === undefined) {
          counts[arr[i]] = 1;
      } else {
          return false;
      }
  }
  return true;
}
export const GoToPath = {
    Dashboard(Id: number,BookOrOfferId?:number) {
      return `/home/${Id}/dashboard${BookOrOfferId?'/'+BookOrOfferId:''}`;
    },
    RideBook(UserId: number, BookingId?: number) {
      return `/home/${UserId}/ride/book${BookingId ? '/update/' + BookingId : ''}`;
    },
    RideOffer(UserId: number, OfferId?: number) {
      return `/home/${UserId}/ride/offer${OfferId ? '/update/' + OfferId : ''}`;
    },
    LogIn() {
      return '/login';
    },
    SignUp_Profile(Id?:number) {
      return `/${Id?'profile/'+Id:''}`;
  },
  Display (Id: number) {
    return `/home/${Id}/display`;
  },
  OfferDetails(ID: number,OfferId?:number) {
    return `/home/${ID}/offerdetails/${OfferId||'all'}`;
  }
};

export function ConvertDateToFormat(date: Date) {
  return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
}
export const MapModelToListItem = ( function() {
  return {
    MapUserToListItem(User: IUser, UserRefId: number):IUserListItem {
      const UserListItem: IUserListItem = {
        EMail: User.EMail,
        Password: User.Password,
        SharepointUserId: UserRefId
      }
      return UserListItem;
    },
    MapViaPointToListItem(ViaPoint: IViaPoint):IViaPointListItem {
      const ViaPointListItem: IViaPointListItem = {
        DistanceFromLastPlace: ViaPoint.DistanceFromLastPlace,
        Place: ViaPoint.Place,
        Coords:StringifyCoordinate(ViaPoint.Coords)
      }
      return ViaPointListItem;
    },
    MapOfferToListItem(Offer: IOffering): IOfferListItem{
      const OfferListItem:IOfferListItem= {
        DestinationPlace: Offer.Destination,
        Discount: Offer.Discount/100,
        Time: Offer.Time,
        Date:CoonvertStringDateToObject(Offer.StartTime).toISOString(),
        DistanceFromLastPlace: Offer.DistanceFromLastPlace,
        DriverRefId: Offer.UserId,
        PricePerKM: Offer.PricePerKM,
        ReachedLocation: Offer.ReachedLocation,
        RoutingEnabled: Offer.Active,
        Setas_x0020_Offered: Offer.SeatsOffered,
        SourcePlace: Offer.Source,
        TotalEarn: Offer.TotalEarn,
        VehicleRefId: Offer.VehicleId,
        ViaPointRefsId: [...Offer.ViaPoints.map(e => e.Id)],
        DestinationCoords: StringifyCoordinate(Offer.DestinationCoords),
        SourceCoords: StringifyCoordinate(Offer.SourceCoords)
      }
      return OfferListItem;
    },
    MapBookingToListItem(Booking: IBooking): IBookingListItem{
      const BookListItem: IBookingListItem = {
        BookingStatus: Booking.Status,Time:Booking.Time,
        CommuterRefId: Booking.CummuterRef,
        DestinationPlace: Booking.Destination,
        FarePrice: Booking.FarePrice,
        SourcePlace: Booking.Source,
        TakerRefId:Booking.PassengerRef,
        DestinationCoords: StringifyCoordinate(Booking.DestinationCoords),
        SourceCoords:StringifyCoordinate(Booking.SourceCoords),
        OData__DCDateCreated: CoonvertStringDateToObject(Booking.DateOfBooking).toISOString(),
        SeatsRequired:Booking.SeatsRequired
      }
      return BookListItem;
    },
    MapVehicleToListItem(Vehicle: IVehicle): IVehicleListItem{
      const VehicleListItem:IVehicleListItem={
        NumberPlate: Vehicle.NumberPlate,
        VehicleCapacity: Vehicle.Capacity,
        Vehicle_x0020_Type:Vehicle.Type
      }
      return VehicleListItem;
    },
  }
})();

export const MapToRouteInfo = function MapListItemsToRouteInfoAndSeatsOfferedInstances(Value: RouteInfoValue):IOfferRouteAndSeatInfo {

  return {
    Id: Value.Id,
    Route: [Value.SourcePlace, ...Value.ViaPointRefs.map(e => e.Place), Value.DestinationPlace],
    SeatsOffered:Value.Setas_x0020_Offered
  }
}
