import * as AppSettings from 'AppSettings';
export enum BookingStatus {
	NOTREQUESTED = "NOT REQUESTED", REQUESTED = "REQUESTED", ACCEPTED = "ACCEPTED", REJECTED ="REJECTED" , DESTROYED ="DESTROYED" , CANCEL = "CANCEL", COMPLETED = "COMPLETED"
}

export enum Discount {
	ZERO = 0, FIVE = 5, TEN = 10, TWENTY = 20
}

export const VehicleCapacity = {
	BIKE: 1, HATCHBACK: 3, SEDAN: 3, SUV: 5
}

export enum VehicleType  {
	BIKE = "BIKE", HATCHBACK = "HATCHBACK", SEDAN = "SEDAN", SUV = "SUV",	
}
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