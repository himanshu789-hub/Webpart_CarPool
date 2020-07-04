import * as React from "react";
import { IOffering } from "../../interface/IOffering";
import { IBooking } from "../../interface/IBooking";
import { IBookingService } from "../../interface/IBookingService";
import { IUserService } from "../../interface/IUserService";
import { IOfferService } from "../../interface/IOfferService";
import {ILocationSuggestService} from "../../interface/ILocationSuggestService";
import { ConstLocationService, ConstUserService, ConstOfferService, ConstBookingService } from "../../constant/injection";
import { injectable, inject, connect } from "react-inversify";
import { IUser } from "../../interface/IUser";
import { User } from "../../model/User";
import {SPHttpClient } from '@microsoft/sp-http';
import { IUpdateLocationInfo } from "../../interface/IUpdateLocationInfo";
import { RouteComponentProps} from "react-router";
import { GoToPath } from "../../utilities/utilities";
import * as styles from './scss/styles.module.scss';
import * as AppSettings from 'AppSettings';
import { IRouteAndDistanceInfo } from "./locales/interface/IRouteAndDistanceInfo";
import { BookingStatus } from "../../constant/carpool";

interface IOfferCardProps extends RouteComponentProps<{}>{
  Offer: IOffering;
  IsOnUpdate: boolean;
  spHttpClient: SPHttpClient;
  BookRequest?: IBooking;
  setErrorMessage: Function;
}

interface IOfferCardDependenciesProps {
  BookingService: IBookingService;
  UserService: IUserService;
  OfferService: IOfferService;
  LocationService: ILocationSuggestService;
}

@injectable()
class Dependencies {
  @inject(ConstLocationService) public readonly LocationService: ILocationSuggestService;
  @inject(ConstUserService) public readonly UserService: IUserService;
  @inject(ConstOfferService) public readonly OfferService: IOfferService;
  @inject(ConstBookingService) public readonly BookingService: IBookingService;
}

interface IOfferCardState {
  Msg: string;
  User: IUser;
  Src: string;
}
class OfferCard extends React.Component<IOfferCardProps & IOfferCardDependenciesProps,IOfferCardState> {
  constructor(props) {
    super(props);
    this.state = {
      Msg: "",
      User: new User(),
      Src:''
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.startRide = this.startRide.bind(this);
    this.handleOfferring = this.handleOfferring.bind(this);
  }
async  startRide() {
    const { Offer, OfferService,spHttpClient,history,setErrorMessage,BookingService } = this.props;
    
  try
  {
    const RejectedIds = [...await BookingService.GetIdOfBookingNotAcceptedUntillReachedLocationByOfferId(Offer.Id, Offer.Source, spHttpClient)];
    Promise.all([...RejectedIds.map((e:number) => BookingService.UpdateBookingStatus({ BookingId: e, BookingStatus: BookingStatus.DESTROYED }, spHttpClient))]).then(responses => {
      responses.map(e => { e ? '' :  setErrorMessage(true , "Some Booking Are Not Rejected");  });
    }
    ).catch(e => {
      setErrorMessage(true,'Error In Updating Rejected Bookings');
    });
    const UpdateLocationInfo: IUpdateLocationInfo = {
      OfferId: Offer.Id,
      ReachedLocation: Offer.Source
    };
    await OfferService.StartARide(Offer.Id, spHttpClient);
    OfferService.UpdateLocation(UpdateLocationInfo, spHttpClient).then(res => {
      const { location:{pathname}} = this.props;
      history.push(GoToPath.OfferDetails(Offer.UserId,Offer.Id));
    });
  
  }catch (e) {
    setErrorMessage(true, (e as Error).message);
  }
    }
 async handleDelete(event) {
    const {setErrorMessage, Offer, OfferService,BookingService, spHttpClient, history} = this.props;
   try
   {
    const AreThereAnyBooking = await BookingService.GetAllOfferedRidesBooking([Offer.Id], spHttpClient);
    if (AreThereAnyBooking.length && AreThereAnyBooking.find(e=>e.Status==BookingStatus.ACCEPTED)) {
      this.setState({ Msg: "You Are Under Service Could Not Delete." });
      return;
    }
    OfferService.Delete(Offer.Id, spHttpClient).then(res => {
     history.push(GoToPath.Display(Offer.Id));
    });
   }
   catch (e) {
     setErrorMessage(true, (e as Error).message);
   }
  }
  handleEdit(event) {
    const { history, Offer } = this.props;
    history.push(GoToPath.OfferDetails(Offer.UserId,Offer.Id));
  }
  componentDidMount() {
    const { Offer,UserService ,spHttpClient} = this.props;
    const {UserId} = Offer;
    UserService.GeyUserById(UserId, spHttpClient).then(res => {
      this.setState({ User: { ...res },Src:AppSettings.tenantURL+res.ProfileImageUrl });
    });
  }
  async handleOfferring(event) {
    const {
      Offer: offer,
      history,
      BookingService,
      spHttpClient
    } = this.props;
    const {BookRequest,setErrorMessage} = this.props;
 
    let book: IBooking = { ...BookRequest };
    // commuter reference  Id
    book.CummuterRef = offer.Id;
    debugger;
    const RouteAndDistanceInfo: IRouteAndDistanceInfo = {
      Route: [offer.Source, ...offer.ViaPoints.map(e => e.Place), offer.Destination],
      PointsDistance: [...offer.ViaPoints.map(e => e.DistanceFromLastPlace), offer.DistanceFromLastPlace]
    };

    const SourcePointIndex = RouteAndDistanceInfo.Route.indexOf(book.Source);
    const DestinationPointIndex = RouteAndDistanceInfo.Route.indexOf(book.Destination)-1;
    let totalDistance:number = 0.00;
    for (let i = SourcePointIndex; i < DestinationPointIndex; i++){
      if (i == DestinationPointIndex)
        totalDistance += offer.DistanceFromLastPlace;
      else
        totalDistance += RouteAndDistanceInfo.PointsDistance[i];
    }
    //fare price of booking
    book.Status = BookingStatus.REQUESTED;
    book.FarePrice = totalDistance * offer.PricePerKM;
    BookingService.Create(book, spHttpClient).then(response => {
      history.push(GoToPath.Display(book.PassengerRef));
    }).catch((e) => {
      setErrorMessage(true, (e as Error).message);
    });
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Offer } = this.props;
    const { User,Src} = this.state;
    const {Source,Destination,PricePerKM,StartTime,SeatsOffered : SeatsAvailable,Discount} = Offer;
    
     
    return (
      <div
        className={styles.default.card+" "+" ".concat(
          isOnUpdate
            ? (Offer.Active == true
              ? styles.default.active+" ".concat(styles.default.makeHeightMore)
              : styles.default.notActive+" ".concat(styles.default.makeHeightMore)
            ): styles.default.hovering
        )}  onClick={this.handleOfferring}
        key={Offer.Id}
      >
        <div id={styles.default.head}>
          <label title={User.FullName}>{User.FullName}</label>
          <img src={Src} />
        </div>
        <div id={styles.default.section1}>
          <div>
            <p>From</p>
            <p title={Source}>{Source}</p>
          </div>
          <div className={styles.default.middleSpace}>
            <img src={''} />
          </div>
          <div>
            <p>To</p>
            <p title={Destination}>{Destination}</p>
          </div>
        </div>
        <div id={styles.default.section2}>
          <div>
            <p>Date</p>
            <p>{StartTime}</p>
          </div>
          <div className={styles.default.middleSpace}></div>
          <div >
            <p>Price</p>
            <p>{PricePerKM}</p>
          </div>
        </div>
        <div id={styles.default.section3}>
          <div >
            <p >Seats</p>
            <p >{SeatsAvailable}</p>
          </div>
          <div >
            <p >Discount</p>
            <p >{Discount}</p>
          </div>
          
        </div>
        {Offer.Active == true ? (
          isOnUpdate ? (
            <div id={styles.default.section4}>
              {Offer.ReachedLocation!=null ? (
                <>
                  <label className={styles.default.safe} onClick={this.handleEdit}>
                    <i className='fa fa-edit'></i>
                  </label>
                  <span className={styles.default.msg}>{this.state.Msg}</span>
                  <label className={styles.default.danger} onClick={this.handleDelete}>
                    <i className='fa fa-trash'></i>
                  </label>
                </>
              ) : (
                <>
                  <button className={styles.default.startRideButton} onClick={this.startRide}>
                    Start Ride
                  </button>
                </>
              )}
            </div>
          ) : (
            ''
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default (connect(Dependencies, (deps, ownProps: IOfferCardProps) => ({
  BookingService: deps.BookingService,
  UserService: deps.UserService,
  LocationService: deps.LocationService,
  OfferService: deps.OfferService,
  history: ownProps.history,
  match: ownProps.match,
  location: ownProps.location,
  Offer: ownProps.Offer,
  IsOnUpdate: ownProps.IsOnUpdate,
}))(OfferCard));
