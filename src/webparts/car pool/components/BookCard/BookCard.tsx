import * as React from "react";
import "./css/styles.css";
import BookDTO from "../../model/Booking";
import { arrayBufferToBase64, GoToPath } from "./../../utilities/utilities";
import pointImg from "../../../public/assests/point.png";
import { BookingStatus } from "../../constant/carpool";
import IBookingStatus from "../../interface/BookingStatus";
import { BookingStatusClassName } from "./locales/constant";
import IUserDTO, { UserDTO } from "../../model/User";
import { injectable, inject } from "inversify";
import IBookingService, { BookingService } from "../../service/BookingService";
import IUserService from "../../service/UserService";
import { connect } from "react-inversify";
import {
  ConstBookingService,
  ConstUserService,
  ConstOfferService,
} from "../../constant/injection";
import IOfferService from "../../service/OfferService";

interface IBookCardProps {
  Book: BookDTO;
  IsOnUpdate: boolean;
  history: any;
  location: any;
  match: any;
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
  User: IUserDTO;
}

class BookCard extends React.Component<
  IBookCardProps & IBookCardDependenciesProps,
  IBookCardState
> {
  constructor(props) {
    super(props);
    this.state = { Src: "", User: new UserDTO() };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }
  handleEdit() {
    const { history, Book, location } = this.props;
    history.push(GoToPath(location.pathname, "ride/book/" + Book.Id));
  }

  handleCancel(event) {
    const { Book, SetBookRides, BookingService } = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.CANCEL,
    };
    BookingService.UpdateBookingStatus(value);
    SetBookRides(true);
  }

  handleReject() {
    const { Book, SetBookRides, BookingService } = this.props;
    const value: IBookingStatus = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.REJECTED,
    };
    BookingService.UpdateBookingStatus(value);
    SetBookRides(false);
  }
  
  handleAccept() {
    const { Book, BookingService, SetBookRides } = this.props;
    const value = {
      BookingId: Book.Id,
      BookingStatus: BookingStatus.ACCEPTED,
    };
    BookingService.UpdateBookingStatus(value);
    SetBookRides(false);
  }
 
  componentDidMount() {
    const {
      IsOnUpdate: isOnUpdate,
      OfferService,
      Book,
      UserService,
    } = this.props;

    if (isOnUpdate) {
      const GetOfferResponse = OfferService.GetById(Book.OfferId);
      GetOfferResponse.then(response => {
        return UserService.GeyUserById(response.data.UserId);
      })
        .then(response => {
          this.setState({ User: response.data });
          return UserService.GetImage(response.data.ImageUploadedName);
        })
        .then(response => {
          
          this.setState({ Src:"data:;base64,"+arrayBufferToBase64(response.data) });
        });
    } else {
      const GetUserResponse = UserService.GeyUserById(Book.UserId);
      GetUserResponse.then(response => {
        this.setState({ User: response.data });
        return UserService.GetImage(response.data.ImageUploadedName);
      }).then(response => {
        this.setState({ Src:"data:;base64,"+ arrayBufferToBase64(response.data) });
      });
    }
  }
  render() {
    const { IsOnUpdate: isOnUpdate, Book } = this.props;
    const { Src: src, User } = this.state;
    const {Source,Destination,DateTime,BookingStatus:BookingSeatStatus,FarePrice,SeatsRequired} = Book;
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

    const DateTimeInLocale:Date = new Date(DateTime + ".000+0000");
    const BookingTime: string =
      DateTimeInLocale.getDate() +
      "/" +
      DateTimeInLocale.getMonth() +
      "/" +
      DateTimeInLocale.getFullYear();

    return (
      <div className={"bookCard ".concat(status)} key={Book.Id}>
        <div id='bookHead'>
          <label>{User.Name}</label>
          <img src={src} />
        </div>
        <div id='section1'>
          <div>
            <p>From</p>
            <p>{Source.LocationName}</p>
          </div>
          <img src={pointImg} />
          <div>
            <p>To</p>
            <p>{Destination.LocationName}</p>
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
export default connect(Dependencies, (deps, ownProps: IBookCardProps) => ({
  UserService: deps.UserService,
  BookingService: deps.BookingService,
  location: ownProps.location,
  match: ownProps.match,
  history: ownProps.history,
  Book: ownProps.Book,
  IsOnUpdate: ownProps.IsOnUpdate,
  OfferService: deps.OfferService,
  SetBookRides: ownProps.SetBookRides,
}))(BookCard);
