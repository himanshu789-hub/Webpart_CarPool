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
import { RouteComponentProps } from "react-router";
import { GoToPath } from "../../utilities/utilities";
import { Booking } from "../../model/Booking";

interface IOfferCardProps extends RouteComponentProps<{}>{
  Offer: IOffering;
  IsOnUpdate: boolean;
  spHttpClient: SPHttpClient;
  BookRequest?: IBooking;
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
  Src: string;
  User: IUser;
}
class OfferCard extends React.Component<IOfferCardProps & IOfferCardDependenciesProps,IOfferCardState> {
  constructor(props) {
    super(props);
    this.state = {
      Msg: "",
      Src: "",
      User: new User(),
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.startRide = this.startRide.bind(this);
    this.handleOfferring = this.handleOfferring.bind(this);
  }
  startRide() {
    const { Offer, OfferService,spHttpClient,history } = this.props;
    const UpdateLocationInfo: IUpdateLocationInfo = {
  OfferId:Offer.Id,ReachedLocation:Offer.Source
}
    OfferService.UpdateLocation(UpdateLocationInfo,spHttpClient).then(res => {
      const { location:{pathname}} = this.props;
      history.push(pathname);
    });
  }
  handleDelete(event) {
    const { Offer, OfferService, spHttpClient, history} = this.props;

    OfferService.Delete(Offer.Id,spHttpClient).then(res => {
      if (res) history.push(GoToPath.Display(Offer.Id));
      else this.setState({ Msg: "Could Not Delete.Please try Again" });
    });
  }
  handleEdit(event) {
    const { history, Offer } = this.props;
    history.push(GoToPath.OfferDetails(Offer.Id));
  }

  async handleOfferring(event) {
    const {
      Offer: offer,
      history,
      BookingService,
      spHttpClient
    } = this.props;
    const {
      BookRequest: { Destination, Source, DateOfBooking:DateTime, PassengerRef:UserId , SeatsRequired },
    } = this.props;
    const {
      location: { pathname },
    } = this.props;
    let book: IBooking = new Booking() ;
    debugger;
    book.CummuterRef = offer.Id;
    book.FarePrice = offer.PricePerKM;
    book.DateOfBooking = DateTime;
    book.SeatsRequired = SeatsRequired;
    book.PassengerRef = UserId;
    BookingService.Create(book,spHttpClient).then(response => {
      history.push(GoToPath.Display(book.PassengerRef));
    });
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Offer } = this.props;
    const { User, Src } = this.state;
    const {Source,Destination,PricePerKM,StartTime,SeatsOffered : SeatsAvailable,Discount,Id} = Offer;
    const StartTimeInLocale = new Date(StartTime.toString() + ".000+0000");
    const OfferringDateTime: string =
      StartTimeInLocale.getDate() +
      "/" +
      StartTimeInLocale.getMonth() +
      "/" +
      StartTimeInLocale.getFullYear();
    return (
      <div
        className={"offerCard".concat(
          isOnUpdate
            ? Offer.Active == true
              ? " active"
              : " notActive"
            : " hovering"
        )}
        key={Offer.Id}
      >
        <div id='offerHead'>
          <label>{User.FullName}</label>
          <img src={User.ProfileImageUrl} />
        </div>
        <div id='section1'>
          <div>
            <p>From</p>
            <p>{Source}</p>
          </div>
          <div>
            <img src={''} />
          </div>
          <div>
            <p>To</p>
            <p>{Destination}</p>
          </div>
        </div>
        <div id='section2'>
          <div id='showDate'>
            <p>Date</p>
            <p>{OfferringDateTime}</p>
          </div>
          <div id='price'>
            <p id='label'>Price</p>
            <p id='priceContent'>{PricePerKM}</p>
          </div>
        </div>
        <div id='section3'>
          <div id='seats'>
            <p id='label'>Seats</p>
            <p id='seatContent'>{SeatsAvailable}</p>
          </div>
        </div>
        {Offer.Active == true ? (
          isOnUpdate ? (
            <div id='section4'>
              {Offer.ReachedLocation!=null ? (
                <>
                  <label className='edit' onClick={this.handleEdit}>
                    <i className='fa fa-edit'></i>
                  </label>
                  <span className='canOfferEditmessage'>{this.state.Msg}</span>
                  <label className='delete' onClick={this.handleDelete}>
                    <i className='far fa-trash-alt'></i>
                  </label>
                </>
              ) : (
                <>
                  <button className='startRide' onClick={this.startRide}>
                    Start Ride
                  </button>
                </>
              )}
            </div>
          ) : (
            <div id='section4'>
              {" "}
              <label className='selectOffer' onClick={this.handleOfferring}>
                <i className='fa fa-check'></i>
              </label>
            </div>
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default connect(Dependencies, (deps, ownProps: IOfferCardProps) => ({
  BookingService: deps.BookingService,
  UserService: deps.UserService,
  LocationService: deps.LocationService,
  OfferService: deps.OfferService,
  history: ownProps.history,
  match: ownProps.match,
  location: ownProps.location,
  Offer: ownProps.Offer,
  IsOnUpdate: ownProps.IsOnUpdate,
}))(OfferCard);
