import { ICoordinateInfo } from "../interface/ICoordinateInfo";

export function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
}

export function GoToPath(input: string, to: string): string {
  const arr: Array<string> = input.split("/");
  return '/'+arr[1] + "/" + arr[2] + "/" + to;
}

export function ParseCoordinate(coords: ICoordinateInfo) {
  return `${coords.Lattitude},${coords.Longitude}`;
}

export function SelectListInURL(listName: string) {
  return `_api/web/lists/getbytitle('${listName}')`;
}

export function ErrorStatusText(statusCode:number, statusText:string):string {
  return `Sever responded with status code '${statusCode}(${statusText})`;
}