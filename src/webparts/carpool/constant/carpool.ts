import * as AppSettings from 'AppSettings';
export enum BookingStatus {
	NOTREQUESTED = "NOT REQUESTED", REQUESTED = "REQUESTED", ACCEPTED = "ACCEPTED", REJECTED ="REJECTED" , DESTROYED ="DESTROYED" , CANCEL = "CANCEL", COMPLETED = "COMPLETED"
}

export const Discount =  {
	ZERO : 0.00, FIVE : 0.05, TEN : 0.10, TWENTY : 0.20
}

export const VehicleType = {
	BIKE : 2, HATCHBACK : 4, SEDAN : 5, SUV :6,	
}
export enum ELocationType {
	SOURCE = 1,DESTINATION = 2
}
export const PlaceHolderImageRelativeUrl: string = '/sites/apps/PublishingImages/placeholder.jpg';
export const Time:Array<string> = ["5am - 9pm", "9am - 12pm", "12pm - 3pm", "3pm - 6pm", "6pm - 9pm"];
export const BookingEntitySet:string = "Booking";
export const OfferEntitySet:string = "Offering";
export const siteURL:string = `${AppSettings.tenantURL}${AppSettings.serverRelativeURL}`;
export const UserEntitySet:string = "User";
export const TravelModeValue: string = "driving";

export const ListNames = {
	ViaPointList: "ViaPoint",
	OfferList: "Offering",
	BookingList: "Booking",
	VehicleList: "Vehicle",
	UserList: 'User'
};