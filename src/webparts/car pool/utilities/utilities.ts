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


export function ParseCoordinate(coords: ICoordinateInfo) {
  return `${coords.Lattitude},${coords.Longitude}`;
}

export function SelectListInURL(listName: string) {
  return `_api/web/lists/getbytitle('${listName}')`;
}

export function ErrorStatusText(statusCode:number, statusText:string):string {
  return `Sever responded with status code '${statusCode}(${statusText})`;
}

export function ParseHttpResponse(response: string): number{
  const responseValue: string[] = response.split(" ");
  return parseInt(responseValue[1]);
}
 
export const GoToPath = {
    Home(Id?: number) {
      return `/home/${Id}/content`;
    },
    RideBook(UserId: number, BookingId?: number) {
      return `/home/${UserId}/ride/book${BookingId ? '/update/' + BookingId : ''}`;
    },
    RideOffer(UserId: number, OfferId?: number) {
      return `/home/${UserId}/ride/book${OfferId ? '/update/' + OfferId : ''}`;
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
  OfferDetails(ID?: number) {
    return `/home/offerdetails${ID ? '/' + ID : ''}`;
  }
};

export const MapModelToListItem = ( function() {
  return {
    MapUserToListItem(User: IUser, UserRefId: number):IUserListItem {
      const UserListItem: IUserListItem = {
        CallbackNumber: User.Contact,
        EMail: User.EMail,
        Password: User.Password,
        SharepointUserId: UserRefId
      }
      return UserListItem;
    },
    MapViaPointToListItem(ViaPoint: IViaPoint):IViaPointListItem {
      const ViaPointListItem: IViaPointListItem = {
        DistanceFromLastPlace: ViaPoint.DistanceFromLastPlace,
        Place: ViaPoint.Place
      }
      return ViaPointListItem;
    },
    MapOfferToListItem(Offer: IOffering): IOfferListItem{
      const OfferListItem:IOfferListItem= {
        DestinationPlace: Offer.Destination,
        Discount: Offer.Discount,
        DistanceFromLastPlace: Offer.DistanceFromLastPlace,
        DriverRefId: Offer.UserId,
        PricePerKM: Offer.PricePerKM,
        ReachedLocation: Offer.ReachedLocation,
        RoutingEnabled: Offer.Active,
        Setas_x0020_Offered: Offer.SeatsOffered,
        SourcePlace: Offer.Source,
        TotalEarn: Offer.TotalEarn,
        VehicleRefId: Offer.VehicleId,
        ViaPointRefsId:Offer.ViaPoints.map(e=>e.Id)
      }
      return OfferListItem;
    },
    MapBookingToListItem(Booking: IBooking): IBookingListItem{
      const BookListItem: IBookingListItem = {
        BookingStatus: Booking.Status,
        CommuterRefId: Booking.PassengerRef,
        DestinationPlace: Booking.Destination,
        FarePrice: Booking.FarePrice,
        SourcePlace: Booking.Source,
        TakerRefId:Booking.PassengerRef
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
    }
  }
})();
