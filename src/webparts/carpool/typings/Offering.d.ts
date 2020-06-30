
declare module "OfferingTyping" {
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
        Time: string;
        PricePerKM: number;
        RoutingEnabled: boolean;
        ReachedLocation?: any;
        RideStartTime?: any;
        SourceCoords: string;
        DestinationCoords: string;
        ID: number;
    }
     interface ViaPointRef {
        Id: number;
        Place: string;
        DistanceFromLastPlace: number;
        Coords: string;
    }
    export interface OfferListItemResponse {
        value: OfferValue[];
    }
}

