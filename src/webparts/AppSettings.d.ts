declare interface IAppSettings {
    tenantURL: string;
    serverRelativeURL: string;
    tenantAPIKey: string;
    BingMaps: {
    LocationServiceURL: string,
    APIKey: string,
    DistanceServiceURL: string
    }
}
declare module 'AppSettings'{
    const appSetting: IAppSettings;
    export = appSetting;
}