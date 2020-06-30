export class RejectError extends Error{
    constructor(message) {
        super(message);
        this.name = "Coordinate Reject Error";
 }
}
export class GeoLocationAPINotSUpportedError extends Error{
    constructor(message) {
        super(message);
        this.name = "GeoLocation API Not Supported Error";
 }
}

export class CallToGetCoordinateBeforeRequestError extends Error{
    constructor(message) {
        super(message);
        this.name = "Out Of Order Function Call";
 }  
}