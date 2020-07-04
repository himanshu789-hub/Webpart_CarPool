import * as React from 'react';
import {IUser} from './../../interface/IUser';
import { Link, RouteComponentProps, Redirect} from 'react-router-dom';
import * as styles from './scss/Dashboard.module.scss';
import { IBooking } from '../../interface/IBooking';
import { injectable, inject, connect } from 'react-inversify';
import { IBookingService } from '../../interface/IBookingService';
import { ConstBookingService } from '../../constant/injection';
import { SPHttpClient } from '@microsoft/sp-http';
import BookCard from '../BookCard/BookCard';
import { GoToPath } from '../../utilities/utilities';
import { Booking } from '../../model/Booking';
import { IOfferService } from '../../interface/IOfferService';

interface TParams{
  bookOrOfferId: string;
}
interface IDashboardDependenciesProps{
  BookingService: IBookingService;
  OfferService: IOfferService;
}
@injectable()
class Dependencies
{
    @inject(ConstBookingService) public readonly BookingService: IBookingService;  
    @inject("OfferService") public readonly OfferService: IOfferService; 
}
interface IDashboardProps extends RouteComponentProps<TParams>{
    User: IUser;
    spHttpClient: SPHttpClient;
  setErrorMessage: Function;
  IsOnBooking: boolean;
  IsOnOffering: boolean;
  bookOrOfferId: number;
}
interface IDashboardState{
    Booking: IBooking;

}
class Dashboard extends React.Component<IDashboardProps &IDashboardDependenciesProps, IDashboardState> {
    constructor(props) {
      super(props);
      const { User:{Id}} = this.props;
      this.state = {
        Booking: { ...new Booking() }
      }
  }
  componentWillReceiveProps(nextProps: IDashboardProps) {
    debugger;
    if (nextProps.bookOrOfferId != this.props.bookOrOfferId) {
      if (nextProps.IsOnBooking) {
        const { BookingService,spHttpClient } = this.props;
        const {bookOrOfferId} = nextProps;
        BookingService.GetById(bookOrOfferId, spHttpClient).then(res => {
          this.setState({ Booking: { ...res } });
        }).catch(e => { debugger;});
      }
    }
  }
    componentDidMount() {
        const { match,BookingService,spHttpClient ,setErrorMessage,OfferService,User,IsOnBooking,bookOrOfferId:bookingId} = this.props;
      const {params }
        = match; 
      const { bookOrOfferId } = params;
      if (IsOnBooking)
      {
        debugger;
        const bookId:number = bookingId || parseInt(bookOrOfferId);
        BookingService.GetById(bookId, spHttpClient).then(res => {
          this.setState({ Booking: { ...res } });
        }).catch(e => {
          setErrorMessage(true, (e as Error).message);
        });
       
      }
       
    }
    render() {
      const { User,IsOnBooking,IsOnOffering } = this.props;
      debugger;
        if (!IsOnBooking && !IsOnOffering)
        {
            return (
                <div className={styles.default.content_base}>
                <p>Hey {User.FullName}!</p>
                <div className={styles.default.content_base_plane}><div
                  className={styles.default.bookingPlane+" ".concat(
                    IsOnBooking || IsOnOffering ?  " "+styles.default.disabled : ""
                  )}
                >
                  <Link to={GoToPath.RideBook(User.Id)}>
                    Book A Ride
                  </Link>
                </div>
                <div
                  className={styles.default.offerPlane.concat(
                    IsOnOffering || IsOnBooking ? " "+styles.default.disabled : ""
                  )}
                >
                  <Link to={GoToPath.RideOffer(User.Id)}>
                    Offer A Ride
                  </Link>
                </div>
                  </div>
                </div>
            );
        }
        else if (IsOnBooking) {
            const { Booking } = this.state;
            return (
                <div className={styles.default.bookingDetail}>
                 <BookCard Book={Booking} IsOnUpdate={true} {...this.props} ></BookCard>
                </div>
            );
        }
        else {
            const { match ,User:{Id},bookOrOfferId:offerId} = this.props;
          const { params } = match;
          const { bookOrOfferId } = params;
            return <Redirect to={GoToPath.OfferDetails(Id,parseInt(bookOrOfferId)||offerId)}/>
        }
            
    }
}

export default (connect(Dependencies, (depsProps, ownProps:IDashboardProps) => ({
    IsOnBooking: ownProps.IsOnBooking,
    IsOnOffering: ownProps.IsOnOffering,
    User: ownProps.User,
    history: ownProps.history,
    location: ownProps.location,
    match: ownProps.match,
    BookingService: depsProps.BookingService,
    spHttpClient: ownProps.spHttpClient,
    setErrorMessage:ownProps.setErrorMessage
}))(Dashboard));