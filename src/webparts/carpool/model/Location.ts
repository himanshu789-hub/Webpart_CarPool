interface ILocationDTO
{
     Longitude:number ;
     LocationName:string ;
     Lattitude:number ;
}
export class LocationDTO implements ILocationDTO{
     Longitude: number;
     LocationName: string;
     Lattitude: number;
     constructor(){
     this.LocationName='';   
    }
}

export default ILocationDTO;