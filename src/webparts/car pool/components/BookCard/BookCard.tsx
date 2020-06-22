import * as React from "react";
import { GoToPath } from "./../../utilities/utilities";
import { BookingStatus } from "../../constant/carpool";
import IBookingStatus from "../../interface/BookingStatus";
import { BookingStatusClassName } from "./locales/constant";
import  { User } from "../../model/User";
import { connect,injectable,inject } from "react-inversify";
import {
  ConstBookingService,
  ConstUserService,
  ConstOfferService,
} from "../../constant/injection";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { IBooking } from "../../interface/IBooking";
import { IUserService } from "../../interface/IUserService";
import { IBookingService } from "../../interface/IBookingService";
import { IOfferService } from "../../interface/IOfferService";
import { IUser } from "../../interface/IUser";
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
    const { history, Book, location,match } = this.props;
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
    const { Book, SetBookRides, BookingService,spHttpClient } = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.REJECTED,
    };
    BookingService.UpdateBookingStatus(value,spHttpClient);
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
      spHttpClient
    } = this.props;

    if (isOnUpdate) {
      const GetOfferResponse = OfferService.GetById(Book.PassengerRef,spHttpClient);
      GetOfferResponse.then(response => {
        return UserService.GeyUserById(response.Id, spHttpClient);
      })
        .then(response => {
          this.setState({ User: { ...response } });
      });
      
    } else {
      const GetUserResponse = UserService.GeyUserById(Book.PassengerRef,spHttpClient);
      GetUserResponse.then(response => {
        this.setState({ User: { ...response } });
      });
    }
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Book } = this.props;
    const { Src: src, User } = this.state;
    const {Source,Destination,FarePrice,Status : BookingSeatStatus,DateTimeOfBooking,SeatsRequired} = Book;
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

    const DateTimeInLocale:Date = new Date(DateTimeOfBooking.toString() + ".000+0000");
    const BookingTime: string =
      DateTimeInLocale.getDate() +
      "/" +
      DateTimeInLocale.getMonth() +
      "/" +
      DateTimeInLocale.getFullYear();

    return (
      <div className={"bookCard ".concat(status)} key={Book.Id}>
        <div id='bookHead'>
          <label>{User.FullName}</label>
          <img src={src} />
        </div>
        <div id='section1'>
          <div>
            <p>From</p>
            <p>{Source}</p>
          </div>
          <img src={""} />
          <div>
            <p>To</p>
            <p>{Destination}</p>
          </div>
        </div>
        <div id='section2'>
          <div id='showDate'>
            <p>Date</p>
            <p>{BookingTime}</p>
          </div>
          <div id='price'>
            <p id='label'>Price</p>
            <p id='priceContent'>{FarePrice}</p>
          </div>
        </div>
        <div id='section3'>
          <div id='seats'>
            <p id='label'>Seats</p>
            <p id='seatContent'>{SeatsRequired}</p>
          </div>
          <div>
            {" "}
            {status == BookingStatusClassName.Requested ||
            status == BookingStatusClassName.Accepted ? (
              isOnUpdate ? (
                <>
                  {status == BookingStatusClassName.Requested ? (
                    <label className='delete' onClick={this.handleCancel}>
                      <i className='far fa-trash-alt'></i>
                    </label>
                  ) : (
                    ""
                  )}
                  <label className='edit' onClick={this.handleEdit}>
                    <i className='fa fa-edit'></i>
                  </label>
                </>
              ) : status != BookingStatusClassName.Accepted ? (
                <>
                  <label className='reject' onClick={this.handleReject}>
                    <i className='fa fa-times'></i>
                  </label>
                  <label className='accept' onClick={this.handleAccept}>
                    <i className='fa fa-check'></i>
                  </label>
                </>
              ) : (
                ""
              )
            ) : (
              <></>
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
