import { ICoordinateInfo } from "../interface/ICoordinateInfo";
export let CurrentLocation = (function () {
  let _longitude: string;
  let _lattitude: string;
  let _IsRequested: boolean;
  const onSuccess = function onAcceptingLocationAccessRequest(coordinates) {
    const { longitude, lattitude } = coordinates.coords;
    _lattitude = lattitude;
    _longitude = longitude;
    _IsRequested = true;
  };
  const onReject = function onDecliningLocationAccesptResquest() {
    history.back();
  }
  return {
    GetCurrentCoordinates() {
      if (!_IsRequested && window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onReject);
      }
      let coords: ICoordinateInfo = {
        Lattitude: _lattitude, Longitude: _longitude
      };
      return coords;
    }
  }
  })(); 
