
declare module 'BookingResponse'
{
    interface BookingResponseListItem {
        value: BookingResponseValue[];
      }
      
      interface BookingResponseValue {
        Id: number;
        TakerRefId?: number;
        SourcePlace: string;
        CommuterRefId?: number;
        FarePrice?: number;
        Time: string;
        BookingStatus: string;
        ID: number;
        SourceCoords: string;
        DestinationCoords: string;
      }
}
declare module 'BookingCountResponse' {

  export interface Value {
      Id: number;
      SeatsRequired: number;
      ID: number;
  }

  export interface BookingCountResponse {
      value: Value[];
  }

}

