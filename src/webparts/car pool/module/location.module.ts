import { ICoordinateInfo } from "../interface/ICoordinateInfo";

export let CurrentLocation = (function () {
  let _longitude: string;
  let _lattitude: string;
  const onSuccess = function onAcceptingLocationAccessRequest(coordinates) {
    const { longitude, lattitude } = coordinates.coords;
    _lattitude = lattitude;
    _longitude = longitude;
  };
  const onReject = function onDecliningLocationAccesptResquest() {
    history.back();
  }
  return {
    RequestForCoordinates() {
      if (window.navigator && window.navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onReject);
      }
   },
    GetCurrentCoordinates() {
      let coords: ICoordinateInfo = {
        Lattitude: _lattitude, Longitude: _longitude
      };
      return coords;
    }
  }
})();