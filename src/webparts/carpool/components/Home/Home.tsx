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
import * as styles from './scss/Home.module.scss';
import Logo from "../Logo/Logo";
import * as AppSetting from 'AppSettings';
import NotFound from "../shared/NotFound/NotFound";

interface TParams  {
  id: string;
  bookingId: string;
  offerId: string;
}
interface IHomeProps  extends RouteComponentProps<TParams>{
  spHttpClient: SPHttpClient;
  setErrorMessage: Function;
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
      this.setState({ User: { ...User },Src:AppSetting.tenantURL+User.ProfileImageUrl });
    }).catch(error => {
     
    });

    const BookingServiceResponse = BookingService.IsUnderBooking(parseInt(id),spHttpClient);
    BookingServiceResponse.then(resolve => {
      if (resolve) this.setState({ IsOnBooking: true });
    }).catch(() => {
      
    });
    const OfferServiceResponse = OfferService.IsUnderOfferring(parseInt(id),spHttpClient);
    OfferServiceResponse.then(response => {
      if (response) this.setState({ IsOnOfferring: true });
    }).catch(() => {
      
    });
  }

  handleDropDown() {
    this.setState(state => {
      return { DisplayDropDown: !state.DisplayDropDown };
    });
  }
  render() {
    const { match } = this.props;
    const {url,params,path} = match;
    const { id } = params;
    const {
      User: user,
      IsOnBooking: isOnBooking,
      IsOnOfferring: isOnOfferring,
    } = this.state;
    return (
      <div className={styles.default.container}>
        <div className={styles.default.home}>
        <Logo/>
          <div
            className={styles.default.info.concat(" ")
              .concat(this.state.DisplayDropDown ? styles.default.displayDropDown : "")}
          >
            <span>{user.FullName}</span>
            <div className={styles.default.listContainer}>
              <img
              src={this.state.Src}
              onClick={this.handleDropDown}
              className={styles.default.profileImage}
            />
            <ul
              className={styles.default.list+" ".concat(styles.default.dropDown+" ").concat(isOnOfferring?styles.default.makeHeightLess:"")}
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
        </div>
        <div className={styles.default.content}>
          <Switch>
          <Route path={this.props.match.path + "/content"}>
            <div className={styles.default.content_base}>
              <p>Hey {user.FullName}!</p>
              <div className={styles.default.content_base_plane}><div
                className={styles.default.bookingPlane+" ".concat(
                  isOnBooking || isOnOfferring ?  " "+styles.default.disabled : ""
                )}
              >
                <Link to={this.props.match.url + "/ride/book"}>
                  Book A Ride
                </Link>
              </div>
              <div
                className={styles.default.offerPlane.concat(
                  isOnOfferring || isOnBooking ? " "+styles.default.disabled : ""
                )}
              >
                <Link to={this.props.match.url + "/ride/offer"}>
                  Offer A Ride
                </Link>
              </div>
                </div>
              </div>
          </Route>
          <Route
            exact
            path={path + "/ride/book"}
            render={props => (
              <Ride {...this.props} isOnBooking={true} isOnUpdate={false} />
            )}
          />
          <Route
            path={path + "/ride/book/update/:bookingId"}
            render={props => (
              <Ride {...this.props} isOnBooking={true} isOnUpdate={true} />
            )}
          />
          <Route
            exact
            path={[path + "/offerDetails/all"]}
            render={props => (
              <OfferDetails {...this.props} {...props} IsOnSingleOffer={false} />
            )}
          />
          <Route
            path={[path + "/offerDetails/:offerId"]}
            render={props => <OfferDetails {...this.props} {...props} IsOnSingleOffer={true} />}
          />
          <Route
            exact
            path={path + "/ride/offer"}
            render={(props) => (
              <Ride {...this.props}  {...props} isOnBooking={false} isOnUpdate={false} />
            )}
          />
          <Route
            path={path + "/display"}
            render={props => (
              <Display {...this.props} {...props} id={id} />
            )}
          />
          <Route
            path={path + "/ride/offer/update/:offerId"}
            render={props => (
              <Ride {...this.props} {...props} isOnBooking={false} isOnUpdate={true} />
            )}
          />
          <Route path="*" component={NotFound}/> 
        </Switch>
        </div>
      </div>
    );
  }
}

export default connect(Dependencies, (deps, ownProps:IHomeProps) => ({
  BookingService: deps.BookingService,
  UserService: deps.UserService,
  OfferService: deps.OfferService,
  history: ownProps.history,
  location: ownProps.location,
  match: ownProps.match,
  setErrorMessage:ownProps.setErrorMessage
}))(Home);
