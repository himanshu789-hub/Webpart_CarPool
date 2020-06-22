declare module 'OfferingTyping' {

    export interface OfferValue {
        ViaPointRefs: ViaPointRef[];
        Id: number;
        SourcePlace: string;
        DestinationPlace: string;
        VehicleRefId: number;
        TotalEarn: number;
        Discount: number;
        Setas_x0020_Offered: number;
        DistanceFromLastPlace: number;
        PricePerKM: number;
        RoutingEnabled: boolean;
        ReachedLocation?: any;
        RideStartTime?: any;
        ID: number;
    }
    export interface ViaPointRef {
        Id: number;
        Place: string;
        DistanceFromLastPlace: number;
    }
    export interface OfferListItemResponse {
        value: OfferValue[];
    }
}

