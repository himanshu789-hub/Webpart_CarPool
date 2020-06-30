import * as React from "react";
import "./css/styles.css";
import { IBookDTO, BookDTO } from "../../model/Booking";
import { arrayBufferToBase64, GoToPath } from "../../utilities/utilities";
import pointImg from "../../../public/assests/point.png";
import Location, { LocationDTO } from "../../model/Location";
import IUserDTO, { UserDTO } from "../../model/User";
import IOfferDTO from "../../model/Offering";
import IBookingService from "../../service/BookingService";
import IUserService from "../../service/UserService";
import IOfferService from "../../service/OfferService";
import ILocationService from "../../service/LocationSuggestService";
import { injectable, connect, inject } from "react-inversify";
import {ConstLocationService,ConstUserService,ConstOfferService,ConstBookingService} from "../../constant/injection";
import { IOfferInfo } from "../../interface/IUpdateLocationInfo";

interface IOfferCardProps {
  Offer: IOfferDTO;
  IsOnUpdate: boolean;
  history: any;
  location: any;
  match: any;
  BookRequest?: IBookDTO;
}

interface IOfferCardDependenciesProps {
  BookingService: IBookingService;
  UserService: IUserService;
  OfferService: IOfferService;
  LocationService: ILocationService;
}

@injectable()
class Dependencies {
  @inject(ConstLocationService)
  public readonly LocationService: ILocationService;
  @inject(ConstUserService) public readonly UserService: IUserService;
  @inject(ConstOfferService) public readonly OfferService: IOfferService;
  @inject(ConstBookingService) public readonly BookingService: IBookingService;
}

interface IOfferCardState {
  Msg: string;
  Src: string;
  User: IUserDTO;
}
class OfferCard extends React.Component<IOfferCardProps & IOfferCardDependenciesProps,IOfferCardState> {
  constructor(props) {
    super(props);
    this.state = {
      Msg: "",
      Src: "",
      User: new UserDTO(),
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.startRide = this.startRide.bind(this);
    this.handleOfferring = this.handleOfferring.bind(this);
  }
  startRide() {
    const { Offer, OfferService } = this.props;
    const OfferInfo: IOfferInfo = {
      OfferId: Offer.Id,
    };
    OfferService.StartRide(OfferInfo).then(res => {
      this.props.history.push(this.props.location.url);
    });
  }
  handleDelete(event) {
    const { Offer, OfferService, history, match } = this.props;
    const { params } = match;
    const { id } = params;

    const data = {
      OfferId: Offer.Id,
    };

    OfferService.Delete(data).then(res => {
      if (res.data) history.push("/home/" + id + "/display");
      else this.setState({ Msg: "Could Not Delete.Please try Again" });
    });
  }
  handleEdit(event) {
    const { history, Offer, location } = this.props;
    const { pathname } = location;
    history.push(GoToPath(pathname, "offerDetails/" + Offer.Id));
  }

  async handleOfferring(event) {
    const {
      Offer: offer,
      history,
      BookingService,
      LocationService,
      match: {
        params: { id },
      },
    } = this.props;
    const {
      BookRequest: { Destination, Source, DateTime, UserId, SeatsRequired },
    } = this.props;
    const {
      location: { pathname },
    } = this.props;
    let book: IBookDTO = new BookDTO();
    book.Source = new LocationDTO();
    book.Destination = new LocationDTO();
    debugger;
    await LocationService.GetCoordinates(Source.LocationName)
      .then(response => {
        const data = JSON.parse(response.data);
        const coordinates = data.resourceSets[0].resources[0].point.coordinates;
        book.Source.LocationName = Source.LocationName;
        book.Source.Lattitude = coordinates[0];
        book.Source.Longitude = coordinates[1];
      })
      .catch(error => {
        this.setState({ Msg: "Bing Server Error" });
        return;
      });
    await LocationService.GetCoordinates(Destination.LocationName)
      .then(response => {
        const data = JSON.parse(response.data);
        const coordinates = data.resourceSets[0].resources[0].point.coordinates;
        book.Destination.LocationName = Destination.LocationName;
        book.Destination.Lattitude = coordinates[0];
        book.Destination.Longitude = coordinates[1];
      })
      .catch(error => {
        this.setState({ Msg: "Bing Server Error" });
        return;
      });
    book.OfferId = offer.Id;
    book.FarePrice = offer.PricePerKM;
    book.DateTime = new Date(DateTime.toUTCString());
    book.SeatsRequired = SeatsRequired;
    book.UserId = UserId;
    BookingService.Create(book).then(response => {
      history.push("/home/" + id + "/display");
    });
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Offer } = this.props;
    const { User, Src } = this.state;
    const {StartTime,Source,Destination,PricePerKM,SeatsAvailable,Discount,Id} = Offer;
    const StartTimeInLocale = new Date(StartTime + ".000+0000");
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
          <label>{User.Name}</label>
          <img src={Src} />
        </div>
        <div id='section1'>
          <div>
            <p>From</p>
            <p>{Source.LocationName}</p>
          </div>
          <div>
            <img src={pointImg} />
          </div>
          <div>
            <p>To</p>
            <p>{Destination.LocationName}</p>
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
              {Offer.IsRideStarted == false ? (
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

  componentDidMount() {
    const { Offer, UserService, OfferService } = this.props;
    UserService.GeyUserById(Offer.UserId)
      .then(res => {
        return UserService.GetImage(res.data.ImageUploadedName);
      })
      .then(res => {
        const image = arrayBufferToBase64(res.data);
        this.setState({ Src: "data:;base64," + image });
      });
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
