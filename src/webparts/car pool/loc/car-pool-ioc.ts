import { Container } from "react-inversify";
import IBookingService,{  BookingService } from '../service/BookingService';
import IUserService, { UserService } from "../service/UserService";
import { ConstBookingService,ConstLocationService,ConstOfferService,ConstUserService, ConstAutoSuggestService } from "../constant/injection";
import IOfferService, { OfferService } from "../service/OfferService";
import ILocationService, { LocationService } from "../service/LocationSuggestService";
import IAutoSuggestService, { AutoSuggestService } from "../service/LocationSuggestService";

export let container = new Container();
container.bind<IBookingService>(ConstBookingService).to(BookingService);
container.bind<IUserService>(ConstUserService).to(UserService);
container.bind<IOfferService>(ConstOfferService).to(OfferService);
container.bind<ILocationService>(ConstLocationService).to(LocationService);
container.bind<IAutoSuggestService>(ConstAutoSuggestService).to(AutoSuggestService);