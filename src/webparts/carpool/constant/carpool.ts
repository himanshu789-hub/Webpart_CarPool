import * as AppSettings from 'AppSettings';
export enum BookingStatus {
	NOTREQUESTED = "NOT REQUESTED", REQUESTED = "REQUESTED", ACCEPTED = "ACCEPTED", REJECTED ="REJECTED" , DESTROYED ="DESTROYED" , CANCEL = "CANCEL", COMPLETED = "COMPLETED"
}

export const Discount =  {
	ZERO : 0, FIVE : 5, TEN : 10, TWENTY : 20
}

export const VehicleType = {
	BIKE : 2, HATCHBACK : 4, SEDAN : 5, SUV :6,	
}

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