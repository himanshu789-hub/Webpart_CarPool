import * as React from "react";
import { Switch } from "react-router";
import { Link, Route } from "react-router-dom";
import Ride from "../Ride/Ride";
import Display from "../Display/Display";
import OfferDetails from "../OfferDetails/OfferDetails";
import { UserDTO } from "../../model/User";
import IBookingService, { BookingService } from "../../service/BookingService";
import IUserService from "../../service/UserService";
import IOfferService from "../../service/OfferService";
import { arrayBufferToBase64 } from "../../utilities/utilities";
import { injectable, inject, connect } from "react-inversify";
import "./css/styles.css";
import styles from './scss/styles.module.scss';

interface HomeProps {
  history: any;
  match: any;
  location: any;
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
  User: UserDTO;
  IsOnBooking: boolean;
  IsOnOfferring: boolean;
}

class Home extends React.Component<
  HomeProps & IHomeDependenciesProps,
  HomeState
> {
  constructor(props) {
    super(props);
    this.state = {
      DisplayDropDown: false,
      Src: "",
      User: {
        EmailId: "",
        Name: "",
        Password: "",
        ImageUploadedName: "",
        Gender: "",
        Age: 0,
      },
      IsOnBooking: false,
      IsOnOfferring: false,
    };
    this.handleDropDown = this.handleDropDown.bind(this);
  }
  componentDidMount() {
    const { BookingService, UserService, OfferService, match } = this.props;
    const { params } = match;
    const { id } = params;
    debugger;
    const GetUserResponse = UserService.GeyUserById(id);
    GetUserResponse.then(response => {
      const User: UserDTO = response.data;
      this.setState({ User: { ...User } });
      return UserService.GetImage(User.ImageUploadedName);
    })
      .then(response => {
        const image = arrayBufferToBase64(response.data);
        this.setState({ Src: "data:;base64," + image });
      })
      .catch(error => {
        //errorLoadingPage
      });

    const BookingServiceResponse = BookingService.IsUnderBooking(id);
    BookingServiceResponse.then(resolve => {
      if (resolve.data) this.setState({ IsOnBooking: true });
    });
    const OfferServiceResponse = OfferService.IsUnderOfferring(id);
    OfferServiceResponse.then(response => {
      if (response.data) this.setState({ IsOnOfferring: true });
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
            <span>{user.Name}</span>
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
              <p>Hey {user.Name}!</p>
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
              <OfferDetails {...props} IsOnSingleOffer={false} />
            )}
          />
          <Route
            path={[this.props.match.path + "/offerDetails/:offerId"]}
            render={props => <OfferDetails {...props} IsOnSingleOffer={true} />}
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
              <Display {...props} id={this.props.match.params.id} />
            )}
          />
          <Route
            path={this.props.match.path + "/ride/offer/update/:offerId"}
            render={props => (
              <Ride {...props} isOnBooking={false} isOnUpdate={true} />
            )}
          />
        </Switch>
      </>
    );
  }
}

export default connect(Dependencies, (deps, ownProps) => ({
  BookingService: deps.BookingService,
  UserService: deps.UserService,
  OfferService: deps.OfferService,
}))(Home);
