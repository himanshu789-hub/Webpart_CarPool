declare module 'BingMapsLocation'
{
    export interface BingMapsResults {
        authenticationResultCode: string;
        brandLogoUri: string;
        copyright: string;
        resourceSets: ResourceSet[];
        statusCode: number;
        statusDescription: string;
        traceId: string;
      }
      
      interface ResourceSet {
        estimatedTotal: number;
        resources: Resource[];
      }
      
      interface Resource {
        __type: string;
        bbox: number[];
        name: string;
        point: Point;
        address: Address;
        confidence: string;
        entityType: string;
        geocodePoints: GeocodePoint[];
        matchCodes: string[];
      }
      
      interface GeocodePoint {
        type: string;
        coordinates: number[];
        calculationMethod: string;
        usageTypes: string[];
      }
      
      interface Address {
        adminDistrict: string;
        adminDistrict2: string;
        countryRegion: string;
        formattedAddress: string;
        locality: string;
        neighborhood: string;
        landmark: string;
      }
      
      interface Point {
        type: string;
        coordinates: number[];
      }
}

declare module 'BingMapsDistance'
{
   export interface BingMapsDistanceResults {
        authenticationResultCode: string;
        brandLogoUri: string;
        copyright: string;
        resourceSets: ResourceSet[];
        statusCode: number;
        statusDescription: string;
        traceId: string;
      }
      
      interface ResourceSet {
        estimatedTotal: number;
        resources: Resource[];
      }
      
      interface Resource {
        __type: string;
        destinations: Destination[];
        origins: Destination[];
        results: Result[];
      }
      
      interface Result {
        destinationIndex: number;
        originIndex: number;
        travelDistance: number;
        travelDuration: number;
      }
      
      interface Destination {
        latitude: number;
        longitude: number;
      }
}