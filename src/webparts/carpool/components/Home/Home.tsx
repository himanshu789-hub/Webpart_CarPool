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
import Dashboard from './../Dashboard/Dashboard';
import { GoToPath } from "../../utilities/utilities";
import { ConstBookingService } from "../../constant/injection";
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
  @inject("UserService") public readonly UserService: IUserService;
  @inject(ConstBookingService) public readonly BookingService: IBookingService;  
  @inject("OfferService") public readonly OfferService: IOfferService; 
}
interface HomeState {
  DisplayDropDown: boolean;
  Src: string;
  User: IUser;
  IsOnBooking: boolean;
  IsOnOffering: boolean;
  bookOrOfferId: number;
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
        EMail: '',
        FullName: '',
        Id: 0,
        Password: '',FileName:'',
        ProfileImageUrl: '',
        
      },bookOrOfferId:0,
      IsOnBooking: false,
      IsOnOffering: false,
    };
    this.handleDropDown = this.handleDropDown.bind(this);
  }
  componentWillReceiveProps(nextProps:IHomeProps) {
    const path:string = nextProps.location.pathname;
    const index: number = path.search(/^\/home\/\d+\/dashboard$/i);
    if (index != -1) {
      const { BookingService, OfferService,spHttpClient } = this.props;
      const { match } = nextProps;
      const {params:{id} } = match;
      Promise.all([BookingService.IsUnderBooking(parseInt(id), spHttpClient),
        OfferService.IsUnderOfferring(parseInt(id), spHttpClient)])
        .then(responses => {
          if (responses[0])
            this.setState({ IsOnBooking: true, IsOnOffering: false,bookOrOfferId:responses[0]});       
          else if (responses[1])
            this.setState({ IsOnBooking: false, IsOnOffering: true,bookOrOfferId:responses[1] });
          else
            this.setState({ IsOnBooking: false, IsOnOffering: false});
      });
    }
  }
  componentDidMount() {
    const { UserService, match, spHttpClient,  setErrorMessage,BookingService,OfferService } = this.props;
    const { params } = match;
    const { id } = params;
    
    UserService.GeyUserById(parseInt(id), spHttpClient).then(response => {
      const User: IUser = { ...response };
      this.setState({ User: { ...User }, Src: AppSetting.tenantURL + User.ProfileImageUrl });
    }).catch(error => {
      setErrorMessage(true, (error as Error).message);
    });

    Promise.all([BookingService.IsUnderBooking(parseInt(id), spHttpClient),
      OfferService.IsUnderOfferring(parseInt(id), spHttpClient)])
      .then(responses => {
        if (responses[0])
          this.setState({ IsOnBooking: true, IsOnOffering: false,bookOrOfferId:responses[0]});       
        else if (responses[1])
          this.setState({ IsOnBooking: false, IsOnOffering: true,bookOrOfferId:responses[1] });
        else
          this.setState({ IsOnBooking: false, IsOnOffering: false});
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
      IsOnOffering: isOnOfferring,bookOrOfferId
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
              className={styles.default.list+" ".concat(styles.default.dropDown+" ").concat(styles.default.makeHeightLess)}
            >
              <li>
                <Link to={url + "/dashboard"}>Home</Link>
              </li>
              <li>
                <Link to={"/profile/" + id}>Profile</Link>
              </li>
              <li>
                <Link to={url + "/display"}>MyRides</Link>
              </li>
                <li>
                  <Link to={url + "/offerDetails/all"}>Offer Details</Link>
                </li>
               
              <li>
                <Link to='/login'>LogOut</Link>
              </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.default.content}>
          <Switch>
          <Route path={[path + "/dashboard",path+'/dashboard/:bookOrOfferId']}  render={(props)=>
              <Dashboard {...this.props} {...props}  User={user} IsOnOffering={isOnOfferring} IsOnBooking={isOnBooking} bookOrOfferId={bookOrOfferId} />}>
          </Route>
          <Route
            exact
            path={ path+ "/ride/book"}
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
  OfferService:deps.OfferService,
  UserService: deps.UserService,
  history: ownProps.history,
  location: ownProps.location,
  match: ownProps.match,
  setErrorMessage:ownProps.setErrorMessage
}))(Home);
