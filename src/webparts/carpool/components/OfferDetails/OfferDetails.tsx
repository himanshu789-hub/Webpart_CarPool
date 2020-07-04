import * as React from "react";
import OfferCard from "../OfferCard/OfferCard";
import { injectable, inject } from "react-inversify";
import { ConstOfferService, ConstUserService, ConstBookingService } from "../../constant/injection";
import { connect } from "react-inversify";
import { IUpdateLocationInfo } from "../../interface/IUpdateLocationInfo";
import { IOfferService } from "../../interface/IOfferService";
import { IUserService } from "../../interface/IUserService";
import { IOffering } from "../../interface/IOffering";
import {SPHttpClient } from '@microsoft/sp-http';
import { RouteComponentProps, withRouter, Redirect } from "react-router";
import * as styles from './scss/styles.module.scss';
import { Offering } from "../../model/Offering";
import { v4 as uuid } from 'uuid';
import { IBookingService } from "../../interface/IBookingService";
import { BookingStatus } from "../../constant/carpool";
import placeholder from './../../assests/moving.png';
import { ExceedLocation } from './../../exception/ExceedLocationException';
import { GoToPath } from "../../utilities/utilities";
interface TParams{
  offerId: string;
  id: string;
 }
interface IOfferDetailsProps extends RouteComponentProps<TParams> {
  IsOnSingleOffer: boolean;
  spHttpClient: SPHttpClient;
  setErrorMessage: Function;
}
interface IOfferDetailDependenciesProps {
  OfferService: IOfferService;
  UserService: IUserService;
  BookingService: IBookingService;
}
@injectable()
class Dependencies {
  @inject(ConstOfferService) public readonly OfferService: IOfferService;
  @inject(ConstUserService) public readonly UserService: IUserService;
  @inject(ConstBookingService) public readonly BookingService: IBookingService;
}

interface IOfferState {
  Offer: IOffering;
  IsSinglOffer: boolean;
  Offers: IOffering[];
  nextLocation: string;
}
class OfferDetails extends React.Component<
  IOfferDetailsProps & IOfferDetailDependenciesProps,
  IOfferState
  > {
  constructor(props) {
    super(props);
    const { IsOnSingleOffer } = this.props;
    this.state = {
      Offer: new Offering(),
      nextLocation: '',
      IsSinglOffer: IsOnSingleOffer,
      Offers: [],
    };
    this.handleReach = this.handleReach.bind(this);
  }
  componentWillReceiveProps(nextProps: IOfferDetailsProps) {
    if (this.props.IsOnSingleOffer != nextProps.IsOnSingleOffer) {
      
      const { OfferService } = this.props;
      const { IsOnSingleOffer, spHttpClient, match, setErrorMessage } = nextProps;
      const { params } = match;
      const { offerId, id } = params;

      this.setState({ IsSinglOffer: IsOnSingleOffer });
      if (IsOnSingleOffer) {
        try {
          OfferService.GetById(Number(offerId), spHttpClient).then(res => {
            this.setState({ Offer: { ...new Offering(), ...res } }, () => {
              this.setState((state) => {
                return {
                  nextLocation: state.Offer.getNextLocation()
                }
              })
            });
          });
        }
        catch (e) {
          if (e instanceof ExceedLocation) {
            this.setState({ nextLocation: null });
          }
          else
            setErrorMessage(true, (e as Error).message);
        }
      } else {

        OfferService.GetAllByUserId(Number(id), spHttpClient).then(res => {
          this.setState({ Offers: [...res] });
        
        }).catch(e => {
          setErrorMessage(true, (e as Error).message);
        });
      }
    }
  }
  componentDidMount() {
    const { IsOnSingleOffer, OfferService, spHttpClient, match, setErrorMessage } = this.props;
    const { params } = match;
    const { offerId, id } = params;
    debugger;
    if (IsOnSingleOffer) {
      try {
        OfferService.GetById(parseInt(offerId), spHttpClient).then(res => {
          this.setState({ Offer: { ...new Offering(), ...res } }, () => {
            try {
              this.setState((state) => { return { nextLocation: state.Offer.getNextLocation() } });
            }
            catch (e) {
              throw e;
            }
          })
        });
      }
      catch (err) {
        if (err instanceof ExceedLocation)
          setErrorMessage(true, 'Unexpected Error, Cannot Get Next Location');
        else
          setErrorMessage(true, (err as Error).message);
      }
    } else {
      OfferService.GetAllByUserId(parseInt(id), spHttpClient).then(res => {
        this.setState({ Offers: [...res] });
      }).catch(e => {
        setErrorMessage(true, (e as Error).message);
      });
    }
  }
  async handleReach() {
    const { OfferService, match, spHttpClient, setErrorMessage, BookingService } = this.props;
    const { params } = match;
    const { offerId } = params;
    const { Offer, nextLocation } = this.state;
    let RejectedIds = null;
    let CompletedBookingIds = null;
    try {
      RejectedIds = [...await BookingService.GetIdOfBookingNotAcceptedUntillReachedLocationByOfferId(Offer.Id, nextLocation, spHttpClient)];
      CompletedBookingIds = [...await BookingService.GetAllCompleted(Offer.Id, nextLocation, spHttpClient)];
     
      const data: IUpdateLocationInfo = {
        OfferId: parseInt(offerId),
        ReachedLocation: nextLocation,
      };
      OfferService.UpdateLocation(data, spHttpClient).then(res => {
        return OfferService.GetById(Offer.Id, spHttpClient);
      }).then(response => {
        this.setState((state) => {
          return { Offer: { ...state.Offer, ReachedLocation: state.nextLocation } }
        }, () => {
            this.setState((state) => { return { nextLocation: state.Offer.getNextLocation() } });
        }
        )
      });
    }
  catch (e) {
    setErrorMessage(true, (e as Error).message);
  }
  
  Promise.all([...RejectedIds.map((e:number) => BookingService.UpdateBookingStatus({ BookingId: e, BookingStatus: BookingStatus.DESTROYED }, spHttpClient))]).then(responses => {
    responses.map(e => { e ? '' :  setErrorMessage(true , "Some Booking Are Not Rejected");  });
  }
  ).catch(e => {
    setErrorMessage(true,'Error In Updating Rejected Bookings');
  });
  Promise.all([...CompletedBookingIds.map((e:number) => BookingService.UpdateBookingStatus({ BookingId: e, BookingStatus: BookingStatus.COMPLETED }, spHttpClient))]).then(responses => {
    responses.map(e => { e ? '' :  setErrorMessage(true , "Some Booking Are Not Updated To Completed");  });
  }
  ).catch(e => {
    setErrorMessage(true,'Error In Updating Completed Bookings');
  });
   
  }
  
  render() {
    const { Offer, IsSinglOffer, nextLocation } = this.state;
    const { Id, Source, Destination, PricePerKM, ReachedLocation: CurrentLocation } = Offer;
    debugger;
    if (IsSinglOffer) {
      if(Offer.UserId && !Offer.IsRideStarted)
        return <Redirect to={GoToPath.OfferDetails(Offer.UserId)} />
      
        return (
        <div>
          <table id={styles.default.offers}>
            <thead>
              <tr>
                  <th colSpan={3} className={styles.default.heading}>Offer Details<img src={placeholder}/></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Offer Id</td>
                <td>{!Offer ? "" : Id}</td>
              </tr>
              <tr>
                <td>Source</td>
                <td>{!Offer ? "" : Source}</td>
              </tr>
              <tr>
                <td>Destination</td>
                <td>{Destination}</td>
              </tr>
              <tr>
                <td>Fare Price(/km)</td>
                <td>{PricePerKM}</td>
              </tr>
              <tr>
                <td className={styles.default.currentLocation}>Your Current Location is </td>
                <td >
                  {CurrentLocation}
                </td>
              </tr>
              {nextLocation && Offer.Active ? (
                <tr>
                  <td>Did You Reach <span className={styles.default.nextLocationContent}>{nextLocation}</span></td>
                  <td>
                    <button
                      className={styles.default.buttonLocationUpdate}
                      onClick={this.handleReach}
                    >
                      <span>YES</span>
                    </button>
                  </td>
                </tr>
              ) : (
                  <></>
                )}
            </tbody>
          </table>
          { !Offer.Active ? (
            <>
              <p className={styles.default.msg_search}>You Have Reached Your Destination<br/><label>--&gt;Journey Ended &lt;--</label></p>
              <p className={styles.default.msg_earning}>
                Your Total Earning Is : {Offer.TotalEarn}
              </p>
            </>
          ) : (
                <></>
            )
          }
        </div>
      );
    }
    else {
      const { Offers } = this.state;
      return (
        <div className={styles.default.offerList}>
          {
            Offers.map(e =>
              <OfferCard {...this.props} key={uuid()} Offer={e} IsOnUpdate={true} />)
         }
        </div>
      );
    }
  }
async  componentDidUpdate(props:IOfferDetailsProps) {
    if(this.state.nextLocation==null )
    {
      const { OfferService,spHttpClient } = this.props;
      const {Offer } = this.state;
      await OfferService.Delete(Offer.Id, spHttpClient);
      OfferService.GetById(Offer.Id, spHttpClient).then(response => {
        this.setState({ Offer: { ...response },nextLocation:'' });
      })
    }
  }

}
export default connect(Dependencies, (deps, ownProps: IOfferDetailsProps) => ({
  UserService: deps.UserService,
  OfferService: deps.OfferService,
  history: ownProps.history,
  location: ownProps.location,
  match: ownProps.match,
  IsOnSingleOffer: ownProps.IsOnSingleOffer,
  BookingService:deps.BookingService
}))(OfferDetails);
