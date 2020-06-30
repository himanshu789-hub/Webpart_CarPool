import * as React from "react";
import OfferCard from "../OfferCard/OfferCard";
import { injectable, inject } from "react-inversify";
import { ConstOfferService, ConstUserService } from "../../constant/injection";
import { connect } from "react-inversify";
import { IUpdateLocationInfo } from "../../interface/IUpdateLocationInfo";
import { IOfferService } from "../../interface/IOfferService";
import { IUserService } from "../../interface/IUserService";
import { IOffering } from "../../interface/IOffering";
import {SPHttpClient } from '@microsoft/sp-http';
import { RouteComponentProps, withRouter } from "react-router";
interface TParams{
  offerId: string;
 }
interface IOfferDetailsProps extends RouteComponentProps<TParams> {
  history: any;
  location: any;
  match: any;
  IsOnSingleOffer: boolean;
  spHttpClient: SPHttpClient;
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
  Offer: IOffering;
  IsSinglOffer: boolean;
  Offers: Array<IOffering>;
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
      Offer: null,
      nextLocation:'',
      IsSinglOffer: IsOnSingleOffer,
      Offers: null,
    };
    this.handleReach = this.handleReach.bind(this);
  }
  componentWillReceiveProps() {
    const { IsOnSingleOffer, OfferService,spHttpClient, match } = this.props;
    const { params } = match;
    const { offerId, id } = params;

    this.setState({ IsSinglOffer: IsOnSingleOffer });
    if (IsOnSingleOffer) {
      OfferService.GetById(Number(offerId),spHttpClient).then(res => {
        this.setState({ Offer: { ...res } });
      });
    } else {
      OfferService.GetAllByUserId(Number(id),spHttpClient).then(res => {
        this.setState({ Offers: {...res} });
      });
    }
  
}
  componentDidMount() {
    const { IsOnSingleOffer, OfferService,spHttpClient, match } = this.props;
    const { params } = match;
    const { offerId, id } = params;

    if (IsOnSingleOffer) {
      OfferService.GetById(Number(offerId),spHttpClient).then(res => {
        this.setState({ Offer: {...res} });
      });

    } else {
      OfferService.GetAllByUserId(Number(id),spHttpClient).then(res => {
        this.setState({ Offers: {...res} });
      });
    }
  }
  handleReach() {
    const {OfferService,match,spHttpClient} = this.props;
    const {params} = match;
    const { offerId } = params;
    const { Offer,nextLocation } = this.state;
   
    const data:IUpdateLocationInfo = {
      OfferId: offerId,
      ReachedLocation:nextLocation,
    }; 
    OfferService.UpdateLocation(data,spHttpClient).then(res => {
      return OfferService.GetById(Offer.Id, spHttpClient);
    }).then(response => {
      const UpdatedOffer: IOffering = { ...response };
      if (UpdatedOffer.getNextLocation() == null)
      {
        
      }
      /////  Completed Offer code left
        
    });
  }
  
  render() {
    const { Offer,  IsSinglOffer,nextLocation } = this.state;
      const { Id, Source, Destination, PricePerKM, ReachedLocation:CurrentLocation } = Offer;
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
                <td>{Offer == null ? "" : Source}</td>
              </tr>
              <tr>
                <td>Destination</td>
                <td>{Offer == null ? "" : Destination}</td>
              </tr>
              <tr>
                <td>Fare Price(/km)</td>
                <td>{Offer == null ? "" : PricePerKM}</td>
              </tr>
              <tr>
                <td>Your Current Location is </td>
                <td>
                  {Offer == null ? "" : CurrentLocation}
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
              <p className='msg-reach'>You Have Reached Your Destination<p>--&gt;Journey Ended &lt;--</p></p>
              <p className='msg-earning'>
                Your Total Earning Is : {Offer.TotalEarn}
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
