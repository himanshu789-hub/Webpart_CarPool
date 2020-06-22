
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
        BookingStatus: string;
        ID: number;
      }
}
