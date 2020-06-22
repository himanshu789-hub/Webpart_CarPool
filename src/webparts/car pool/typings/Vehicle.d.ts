declare module 'VehicleResponse' {
    export interface VehicleResponseListItems {
        value: VehicleValue[];
      }
      
      export interface VehicleValue {
        FileSystemObjectType: number;
        Id: number;
        ServerRedirectedEmbedUri?: any;
        ServerRedirectedEmbedUrl: string;
        ContentTypeId: string;
        Title?: any;
        ComplianceAssetId?: any;
        NumberPlate: string;
        Vehicle_x0020_Type: string;
        VehicleCapacity: number;
        ID: number;
        Modified: string;
        Created: string;
        AuthorId: number;
        EditorId: number;
        OData__UIVersionString: string;
        Attachments: boolean;
        GUID: string;
      }
}