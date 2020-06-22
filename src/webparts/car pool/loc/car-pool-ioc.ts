import { Container } from "react-inversify";
import { IBookingService } from "../interface/IBookingService";
import { IUserService } from "../interface/IUserService";
import { IOfferService } from "../interface/IOfferService";
import { ILocationSuggestService } from "../interface/ILocationSuggestService";
import { IDistanceService } from "../interface/IDistanceService";
import { DistanceService } from "../service/DistanceService";
import { LocationService } from "../service/LocationSuggestService";
import { OfferService } from "../service/OfferService";
import { UserService } from "../service/UserService";
import { BookingService } from "../service/BookingService";
import { ConstBookingService, ConstUserService, ConstOfferService, ConstLocationService } from "../constant/injection";

export let container = new Container();
container.bind<IBookingService>(ConstBookingService).to(BookingService);
container.bind<IUserService>(ConstUserService).to(UserService);
container.bind<IOfferService>(ConstOfferService).to(OfferService);
container.bind<ILocationSuggestService>(ConstLocationService).to(LocationService);
container.bind<IDistanceService>("DistanceService").to(DistanceService);