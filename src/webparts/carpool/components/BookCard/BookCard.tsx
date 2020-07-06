import * as React from "react";
import { GoToPath } from "./../../utilities/utilities";
import { BookingStatus, siteURL } from "../../constant/carpool";
import IBookingStatus from "../../interface/BookingStatus";
import { BookingStatusClassName } from "./locales/constant";
import  { User } from "../../model/User";
import { connect,injectable,inject } from "react-inversify";
import {  ConstBookingService,ConstUserService,ConstOfferService} from "../../constant/injection";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { IBooking } from "../../interface/IBooking";
import { IUserService } from "../../interface/IUserService";
import { IBookingService } from "../../interface/IBookingService";
import { IOfferService } from "../../interface/IOfferService";
import { IUser } from "../../interface/IUser";
import * as styles from "./scss/styles.module.scss";
import * as AppSettings from 'AppSettings';
import {SPHttpClient } from '@microsoft/sp-http';
interface TParams{
  id: string;
  bookingId: string;
}
interface IBookCardProps extends RouteComponentProps<TParams> {
  Book: IBooking;
  IsOnUpdate: boolean;
  spHttpClient: SPHttpClient;
  SetBookRides?: Function;
	setErrorMessage: Function;
}
interface IBookCardDependenciesProps {
  BookingService: IBookingService;
  UserService: IUserService;
  OfferService: IOfferService;
}

@injectable()
class Dependencies {
  @inject(ConstBookingService) public readonly BookingService: IBookingService;
  @inject(ConstUserService) public readonly UserService: IUserService;
  @inject(ConstOfferService) public readonly OfferService: IOfferService;
}

interface IBookCardState {
  Src: string;
  User: IUser;
}

class BookCard extends React.Component<
  IBookCardProps & IBookCardDependenciesProps,
  IBookCardState
> {
  constructor(props) {
    super(props);
    this.state = { Src: "", User: new User() };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }

 async handleCancel(event) {
    const { Book, SetBookRides, BookingService ,spHttpClient,location,history} = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.CANCEL,
    };
   await BookingService.UpdateBookingStatus(value, spHttpClient);
   if (location.pathname.includes("dashboard"))
     history.push(location.pathname);
   else
    SetBookRides(true);
  }

 async handleReject() {
    const { Book, SetBookRides, BookingService, spHttpClient } = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.REJECTED,
    }
     await BookingService.UpdateBookingStatus(value, spHttpClient);
      SetBookRides(false);
  }
  
 async handleAccept() {
    const { Book, BookingService, SetBookRides,spHttpClient ,OfferService} = this.props;
   try {
    const value = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.ACCEPTED,
    };
   const offer = await OfferService.GetById(Book.CummuterRef, spHttpClient);
     OfferService.Update({ ...offer, TotalEarn: (offer.TotalEarn + Book.FarePrice)*(1-offer.Discount) }, spHttpClient);
   await BookingService.UpdateBookingStatus(value,spHttpClient);
    SetBookRides(false);
   
   } catch (e) {
     
  }
   }
  componentWillReceiveProps(nextProps:IBookCardProps) {
    if (nextProps.Book.PassengerRef != this.props.Book.PassengerRef) {
      const { UserService,OfferService, spHttpClient,setErrorMessage } = this.props;
      const { Book ,IsOnUpdate} = nextProps;
      if (IsOnUpdate) {
        OfferService.GetById(Book.CummuterRef, spHttpClient)
          .then(response => {
          return UserService.GeyUserById(response.UserId, spHttpClient);
        }).then(response => {
            this.setState({ User: { ...response }, Src:AppSettings.tenantURL + response.ProfileImageUrl });
        }).catch(e => {
          setErrorMessage(true, (e as Error).message);
        });
      } else {
        UserService.GeyUserById(Book.PassengerRef, spHttpClient)
          .then(response => {
          this.setState({ User: { ...response }, Src: AppSettings.tenantURL + response.ProfileImageUrl });
        }).catch(e => {
          setErrorMessage(true, (e as Error).message);
        });
      }
   }
 }
  componentDidMount() {
    const {
      IsOnUpdate: isOnUpdate,
      OfferService,
      Book,
      UserService,
      spHttpClient,setErrorMessage
    } = this.props;
    debugger;
    try {
      if (Book.PassengerRef)
      {
        if (isOnUpdate) {
          OfferService.GetById(Book.CummuterRef, spHttpClient)
            .then(response => {
              return UserService.GeyUserById(response.UserId, spHttpClient);
            }).then(response => {
              this.setState({ User: { ...response }, Src: AppSettings.tenantURL + response.ProfileImageUrl });
            });
        } else {
          UserService.GeyUserById(Book.PassengerRef, spHttpClient)
            .then(response => {
              this.setState({ User: { ...response }, Src: AppSettings.tenantURL + response.ProfileImageUrl });
            });
        }
      }
      
    } catch (error) {
      setErrorMessage(true, (error as Error).message);
    }
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Book } = this.props;
    const { Src: src, User } = this.state;
    const {Source,Destination,FarePrice,Status : BookingSeatStatus,DateOfBooking: DateTimeOfBooking,SeatsRequired} = Book;
    let status = "";

    if (BookingSeatStatus == BookingStatus.REQUESTED)
      status = BookingStatusClassName.Requested;
    else if (BookingSeatStatus == BookingStatus.ACCEPTED)
      status = BookingStatusClassName.Accepted;
    else if (BookingSeatStatus == BookingStatus.REJECTED)
      status = BookingStatusClassName.Rejected;
    else if (BookingSeatStatus == BookingStatus.DESTROYED)
      status = BookingStatusClassName.Destroyed;
    else if (BookingSeatStatus == BookingStatus.CANCEL)
      status = BookingStatusClassName.Cancel;
    else if (BookingSeatStatus == BookingStatus.COMPLETED)
      status = BookingStatusClassName.Completed;
    else status = BookingStatusClassName.None;
 
    debugger;
    return (
      <div className={`${styles.default.card} `.concat(status)} key={Book.Id}>
        <div id={styles.default.head}>
          <label title={User.FullName}>{User.FullName}</label>
          <img src={src} />
        </div>
        <div id={styles.default.section1}>
          <div>
            <p>From</p>
            <p title={Source}>{Source}</p>
          </div>
          <div className={styles.default.middleSpace}><img src={""} /> </div>
          <div>
            <p>To</p>
            <p title={Destination}>{Destination}</p>
          </div>
        </div>
        <div id={styles.default.section2}>
          <div>
            <p>Date</p>
            <p>{DateTimeOfBooking}</p>
          </div>
          <div className={styles.default.middleSpace}> </div>
          
          <div>
            <p>Price</p>
            <p>{FarePrice}</p>
          </div>
        </div>
        <div id={styles.default.section3}>
          <div>
            <p >Seats</p>
            <p >{SeatsRequired}</p>
          </div>
          <div className={styles.default.middleSpace}> </div>
        
          <div className={styles.default.editSection}>
            { 
              isOnUpdate ? (status == BookingStatusClassName.Requested ? (
                  <> 
                  <label className={styles.default.danger}   onClick={this.handleCancel}>
                      <i className='fa fa-trash'></i>
                  </label>
                </>
                  ) : (
                    <label className={styles.default.status+" ".concat(styles.default.bookingStatus)}>{BookingSeatStatus}</label>
                  )
                  
              ) : status == BookingStatusClassName.Requested ? (
                <>
                  <label className={styles.default.danger} onClick={this.handleReject}>
                    <i className='fa fa-times'></i>
                  </label>
                  <label className={styles.default.safe} onClick={this.handleAccept}>
                    <i className='fa fa-check'></i>
                  </label>
                </>
              ) : (
                    <label className={styles.default.status+" ".concat(styles.default.offerBookingStatus)}>{BookingSeatStatus}</label>
              )}
          </div>
        </div>
      </div>
    );
  }
}
export default  withRouter(connect(Dependencies, (deps, ownProps: IBookCardProps) => ({
  UserService: deps.UserService,
  BookingService: deps.BookingService,
  location: ownProps.location,
  match: ownProps.match,
  history: ownProps.history,
  Book: ownProps.Book,
  IsOnUpdate: ownProps.IsOnUpdate,
  OfferService: deps.OfferService,
  SetBookRides: ownProps.SetBookRides,
}))(BookCard));
