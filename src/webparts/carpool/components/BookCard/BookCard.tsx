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

import {SPHttpClient } from '@microsoft/sp-http';
interface TParams{
  id: string;
  bookingId: string;
}
interface IBookCardProps extends RouteComponentProps<TParams> {
  Book: IBooking;
  IsOnUpdate: boolean;
  spHttpClient: SPHttpClient;
  SetBookRides: Function;
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
    this.handleEdit = this.handleEdit.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }
  handleEdit() {
    const { history,match } = this.props;
    const {params:{bookingId,id} } = match
    history.push(GoToPath.RideBook(parseInt(id),parseInt(bookingId)));
  }

  handleCancel(event) {
    const { Book, SetBookRides, BookingService ,spHttpClient} = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.CANCEL,
    };
    BookingService.UpdateBookingStatus(value,spHttpClient);
    SetBookRides(true);
  }

  handleReject() {
    const { Book, SetBookRides, BookingService, spHttpClient } = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.REJECTED,
    }
      BookingService.UpdateBookingStatus(value, spHttpClient);
      SetBookRides(false);
  }
  
  handleAccept() {
    const { Book, BookingService, SetBookRides,spHttpClient } = this.props;
    const value = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.ACCEPTED,
    };
    BookingService.UpdateBookingStatus(value,spHttpClient);
    SetBookRides(false);
  }
 
  componentDidMount() {
    const {
      IsOnUpdate: isOnUpdate,
      OfferService,
      Book,
      UserService,
      spHttpClient,setErrorMessage
    } = this.props;
    try {
      if (isOnUpdate) {
        const GetOfferResponse = OfferService.GetById(Book.PassengerRef,spHttpClient);
        GetOfferResponse.then(response => {
          return UserService.GeyUserById(response.Id, spHttpClient);
        }).then(response => {
            this.setState({ User: { ...response }, Src: siteURL + response.ProfileImageUrl });
        });
        
      } else {
        const GetUserResponse = UserService.GeyUserById(Book.PassengerRef,spHttpClient);
        GetUserResponse.then(response => {
          this.setState({ User: { ...response }, Src: siteURL + response.ProfileImageUrl });
        });
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
    debugger;
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

 
    return (
      <div className={`${styles.default.bookCard} `.concat(status)} key={Book.Id}>
        <div id={styles.default.bookHead}>
          <label>{User.FullName}</label>
          <img src={src} />
        </div>
        <div id={styles.default.section1}>
          <div>
            <p>From</p>
            <p>{Source}</p>
          </div>
          <div ><img src={""} /> </div>
          <div>
            <p>To</p>
            <p>{Destination}</p>
          </div>
        </div>
        <div id={styles.default.section2}>
          <div>
            <p>Date</p>
            <p>{DateTimeOfBooking}</p>
          </div>
          <div>
            <p>{FarePrice}</p>
          </div>
        </div>
        <div id={styles.default.section3}>
          <div>
            <p >Seats</p>
            <p >{SeatsRequired}</p>
          </div>
          <div>
            { 
              isOnUpdate ? (status == BookingStatusClassName.Requested ? (
                  <> 
                  <label className={'delete'} onClick={this.handleCancel}>
                      <i className='far fa-trash-alt'></i>
                    </label>
                    <label className='edit' onClick={this.handleEdit}>
                    <i className='fa fa-edit'></i>
                  </label>
                </>
                  ) : (
                    ""
                  )
                  
              ) : status != BookingStatusClassName.Accepted ? (
                <>
                  <label className={styles.default.reject} onClick={this.handleReject}>
                    <i className='fa fa-times'></i>
                  </label>
                  <label className={styles.default.accept} onClick={this.handleAccept}>
                    <i className='fa fa-check'></i>
                  </label>
                </>
              ) : (
                ""
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
