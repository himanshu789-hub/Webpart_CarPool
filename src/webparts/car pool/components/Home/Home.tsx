import * as React from "react";
import { Switch, RouteComponentProps, withRouter } from "react-router";
import { Link, Route } from "react-router-dom";
import Ride from "../Ride/Ride";
import Display from "../Display/Display";
import OfferDetails from "../OfferDetails/OfferDetails";
import { IUser } from "./../../interface/IUser";
import { injectable, inject, connect } from "react-inversify";
import { IBookingService } from './../../interface/IBookingService';
import { IOfferService } from './../../interface/IOfferService';
import { IUserService } from './../../interface/IUserService';
import { SPHttpClient } from '@microsoft/sp-http';

interface TParams  {
  id: string;
  bookingId: string;
  offerId: string;
}
interface IHomeProps  extends RouteComponentProps<TParams>{
  spHttpClient: SPHttpClient;
}

interface IHomeDependenciesProps {
  BookingService: IBookingService;
  UserService: IUserService;
  OfferService: IOfferService;
}

@injectable()
class Dependencies {
  @inject("BookingService") public readonly BookingService: IBookingService;
  @inject("UserService") public readonly UserService: IUserService;
  @inject("OfferService") public readonly OfferService: IOfferService;
}
interface HomeState {
  DisplayDropDown: boolean;
  Src: string;
  User: IUser;
  IsOnBooking: boolean;
  IsOnOfferring: boolean;
}

class Home extends React.Component<
  IHomeProps & IHomeDependenciesProps,
  HomeState
> {
  constructor(props) {
    super(props);
    this.state = {
      DisplayDropDown: false,
      Src: "",
      User: {
        Active: true,
        Contact: '',
        EMail: '',
        FullName: '',
        Id: 0,
        Password: '',
        ProfileImageUrl:''
      },
      IsOnBooking: false,
      IsOnOfferring: false,
    };
    this.handleDropDown = this.handleDropDown.bind(this);
  }
  componentDidMount() {
    const { BookingService, UserService, OfferService, match,spHttpClient } = this.props;
    const { params } = match;
    const { id } = params;

     UserService.GeyUserById(parseInt(id),spHttpClient).then(response => {
      const User: IUser = {...response};
      this.setState({ User: { ...User } });
    }).catch(error => {
     
    });

    const BookingServiceResponse = BookingService.IsUnderBooking(parseInt(id),spHttpClient);
    BookingServiceResponse.then(resolve => {
      if (resolve) this.setState({ IsOnBooking: true });
    });
    const OfferServiceResponse = OfferService.IsUnderOfferring(parseInt(id),spHttpClient);
    OfferServiceResponse.then(response => {
      if (response) this.setState({ IsOnOfferring: true });
    });
  }

  shouldComponentUpdate() {
    return true;
  }
  handleDropDown() {
    this.setState(state => {
      return { DisplayDropDown: !state.DisplayDropDown };
    });
  }
  render() {
    const { match } = this.props;
    const {url,params} = match;
    const { id } = params;
    const {
      User: user,
      IsOnBooking: isOnBooking,
      IsOnOfferring: isOnOfferring,
    } = this.state;
    return (
      <>
        <div id='home'>
          <div id='head'>
            <span>Ya!</span>
          </div>
          <div
            className={"info "
              .concat(this.state.DisplayDropDown ? " displayDropDown" : "")
              .concat(isOnOfferring ? " makeheightless" : "")}
          >
            <span>{user.FullName}</span>
            <img
              src={this.state.Src}
              onClick={this.handleDropDown}
              className='userProfile'
            />
            <ul
              className={"list dropdown".concat(
                isOnOfferring ? " makeheightless" : ""
              )}
            >
              <li>
                <Link to={url + "/content"}>Home</Link>
              </li>
              <li>
                <Link to={"/profile/" + id}>Profile</Link>
              </li>
              <li>
                <Link to={url + "/display"}>MyRides</Link>
              </li>
              {isOnOfferring ? (
                <li>
                  <Link to={url + "/offerDetails/all"}>Offer Details</Link>
                </li>
              ) : (
                ""
              )}
              <li>
                <Link to='/login'>LogOut</Link>
              </li>
            </ul>
          </div>
        </div>

        <Switch>
          <Route path={this.props.match.path + "/content"}>
            <div id='content'>
              <p>Hey {user.FullName}!</p>
              <div
                className={"book ".concat(
                  isOnBooking || isOnOfferring ? "disabled" : ""
                )}
              >
                <Link to={this.props.match.url + "/ride/book"}>
                  Book A Ride
                </Link>
              </div>
              <div
                className={"offer ".concat(
                  isOnOfferring || isOnBooking ? "disabled" : ""
                )}
              >
                <Link to={this.props.match.url + "/ride/offer"}>
                  Offer A Ride
                </Link>
              </div>
            </div>
          </Route>
          <Route
            exact
            path={this.props.match.path + "/ride/book"}
            render={props => (
              <Ride {...props} isOnBooking={true} isOnUpdate={false} />
            )}
          />
          <Route
            path={this.props.match.path + "/ride/book/update/:bookingId"}
            render={props => (
              <Ride {...props} isOnBooking={true} isOnUpdate={true} />
            )}
          />
          <Route
            exact
            path={[this.props.match.path + "/offerDetails/all"]}
            render={props => (
              <OfferDetails {...this.props} IsOnSingleOffer={false} />
            )}
          />
          <Route
            path={[this.props.match.path + "/offerDetails/:offerId"]}
            render={props => <OfferDetails {...this.props} IsOnSingleOffer={true} />}
          />
          <Route
            exact
            path={this.props.match.path + "/ride/offer"}
            render={props => (
              <Ride {...props} isOnBooking={false} isOnUpdate={false} />
            )}
          />
          <Route
            path={this.props.match.path + "/display"}
            render={props => (
              <Display {...this.props} id={this.props.match.params.id} />
            )}
          />
          <Route
            path={this.props.match.path + "/ride/offer/update/:offerId"}
            render={props => (
              <Ride {...this.props} isOnBooking={false} isOnUpdate={true} />
            )}
          />
        </Switch>
      </>
    );
  }
}

export default withRouter(connect(Dependencies, (deps, ownProps:IHomeProps) => ({
  BookingService: deps.BookingService,
  UserService: deps.UserService,
  OfferService: deps.OfferService,
  history: ownProps.history,
  location: ownProps.location,
  match: ownProps.match,
}))(Home));
