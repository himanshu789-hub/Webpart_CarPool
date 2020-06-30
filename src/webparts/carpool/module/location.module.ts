import { ICoordinateInfo } from "../interface/ICoordinateInfo";
import { CallToGetCoordinateBeforeRequestError, GeoLocationAPINotSUpportedError } from "../exception/CoordinateException";
export let CurrentLocation = (function () {
  let _longitude: string;
  let _lattitude: string;
  let _IsSupported: boolean = true;
  let _IsRejected: boolean = false;
  let _IsRequestInitiated: boolean = false;
  const onSuccess = function onAcceptingLocationAccessRequest(coordinates) {
    const { longitude, latitude } = coordinates.coords;
    _lattitude = latitude;
    _longitude = longitude;
    _IsRejected = false;
  };
  const onReject = function onDecliningLocationAccesptResquest() {
    _IsRejected = true;
  }
  return {
    RequestCurrentCoordinates(){
      if (_IsRequestInitiated)
        return;
      if (window.navigator && window.navigator.geolocation) {
        _IsSupported = true;
        _IsRequestInitiated = true;
        navigator.geolocation.getCurrentPosition(onSuccess, onReject);
      }
      else
      {
        _IsSupported = false;    
      }
    },
    GetCurrentCoordinates(): ICoordinateInfo {
      if (!_IsRequestInitiated)
        throw new CallToGetCoordinateBeforeRequestError('Call to get before requesting geocordinates');
      if (!_IsSupported)
        throw new GeoLocationAPINotSUpportedError("GeoLocation Not Supported By Browser . . .");
        
      if (!_IsRejected) {
        let coords: ICoordinateInfo = {
          Lattitude: _lattitude, Longitude: _longitude
        };
        return coords;
      }
      else
        return null;
    }
  }
  })(); 
