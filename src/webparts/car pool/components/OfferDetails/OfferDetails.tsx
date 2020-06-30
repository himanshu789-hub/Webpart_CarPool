import * as React from "react";
import OfferCard from "../OfferCard/OfferCard";
import "./css/styles.css";
import IOfferService, { OfferService } from "../../service/OfferService";
import IUserService from "../../service/UserService";
import { injectable, inject } from "react-inversify";
import { ConstOfferService, ConstUserService } from "../../constant/injection";
import { connect } from "react-inversify";
import { IUpdateLocationInfo, IOfferInfo } from "../../interface/IUpdateLocationInfo";
import IOfferDTO, { OfferDTO } from "../../model/Offering";

interface IOfferDetailsProps {
  history: any;
  location: any;
  match: any;
  IsOnSingleOffer: boolean;
}
interface IOfferDetailDependenciesProps {
  OfferService: IOfferService;
  UserService: IUserService;
}
@injectable()
class Dependencies {
  @inject(ConstOfferService) public readonly OfferService: IOfferService;
  @inject(ConstUserService) public readonly UserService: IUserService;
}

interface IOfferState {
  Offer: IOfferDTO;
  IsSinglOffer: Boolean;
  nextLocation: string;
  Offers: Array<OfferDTO>;
}
class OfferDetails extends React.Component<
  IOfferDetailsProps & IOfferDetailDependenciesProps,
  IOfferState
> {
  constructor(props) {
    super(props);
    const { IsOnSingleOffer } = this.props;
    this.state = {
      Offer: null,
      IsSinglOffer: IsOnSingleOffer,
      nextLocation: "",
      Offers: null,
    };
    this.handleNextStation = this.handleNextStation.bind(this);
    this.handleReach = this.handleReach.bind(this);
  }
  componentWillReceiveProps() {
    const { IsOnSingleOffer, OfferService, match } = this.props;
    const { params } = match;
    const { offerId, id } = params;

    this.setState({ IsSinglOffer: IsOnSingleOffer });
    if (IsOnSingleOffer) {
      OfferService.GetById(Number(offerId)).then(res => {
        this.setState({ Offer: res.data });
        this.handleNextStation();
      });
    } else {
      OfferService.GetAllByUserId(Number(id)).then(res => {
        this.setState({ Offers: res.data });
      });
    }
  
}
  componentDidMount() {
    const { IsOnSingleOffer, OfferService, match } = this.props;
    const { params } = match;
    const { offerId, id } = params;

    if (IsOnSingleOffer) {
      OfferService.GetById(Number(offerId)).then(res => {
        this.setState({ Offer: res.data });
        this.handleNextStation();
      });
    } else {
      OfferService.GetAllByUserId(Number(id)).then(res => {
        this.setState({ Offers: res.data });
      });
    }
  }
  handleReach() {
    const {OfferService,match} = this.props;
    const {params} = match;
    const { nextLocation } = this.state;
    const { offerId, id } = params;
   
    const data:IUpdateLocationInfo = {
      OfferId: offerId,
      ReachedLocation: nextLocation,
    };

    OfferService.UpdateLocation(data).then(res => {
      this.handleNextStation();
    });
  }
  handleNextStation() {
      const {OfferService,match} = this.props;
    const { params } = match;
    const {offerId} = params;
    const data:IOfferInfo = {
      OfferId: offerId,
    };
   
   OfferService.HandleNextLocation(data).then(res => {
      debugger;
      const responseValue = res.data;
      this.setState({
        nextLocation: responseValue == "" ? null : responseValue,
      });
    });
  }
  render() {
    const { Offer, nextLocation, IsSinglOffer } = this.state;
    const {Id,Source,Destination,PricePerKM,CurrentLocation} = Offer;
    if (IsSinglOffer)
      return (
        <div className='OfferDetails'>
          <table id='offers'>
            <thead>
              <tr>
                <th colSpan={3}>Offer Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Offer Id</td>
                <td>{Offer == null ? "" : Id}</td>
              </tr>
              <tr>
                <td>Source</td>
                <td>{Offer == null ? "" : Source.LocationName}</td>
              </tr>
              <tr>
                <td>Destination</td>
                <td>{Offer == null ? "" : Destination.LocationName}</td>
              </tr>
              <tr>
                <td>Fare Price(/km)</td>
                <td>{Offer == null ? "" : PricePerKM}</td>
              </tr>
              <tr>
                <td>Your Current Location is </td>
                <td>
                  {Offer == null ? "" : CurrentLocation.LocationName}
                </td>
              </tr>
              {nextLocation != null ? (
                <tr>
                  <td>Did You Reach {nextLocation}</td>
                  <td>
                    <button
                      className='buttonLocationUpdate'
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
          {Offer == null ? (
            ""
          ) : Offer.Active == false ? (
            <>
              <p className='msg-reach'>You Have Reached Your Destination<p>-->Journey Ended &lt;--</p></p>
              <p className='msg-earning'>
                Your Total Earning Is : {Offer.TotalEarning}
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      );
    else {
      const { Offers } = this.state;
      return (
        <div className='offerList'>
          {Offers != null
            ? Offers.map(e => (
                <OfferCard {...this.props} Offer={e} IsOnUpdate={true} />
              ))
            : ""}
        </div>
      );
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
}))(OfferDetails);
