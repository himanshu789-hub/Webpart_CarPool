export interface IBooking {
	Id: number;
    Status :string;
    CummuterRef :number;
    Destination :string;
    FarePrice :number;
    Source :string;
    PassengerRef :number;
    SeatsRequired: number;
    DateTimeOfBooking: Date;
}