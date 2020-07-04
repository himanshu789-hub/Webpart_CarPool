import * as React from "react";
import { IBooking } from "../../../../interface/IBooking";
import { RouteComponentProps } from "react-router";
import OfferCard from "../../../OfferCard/OfferCard";
import { IOffering } from "../../../../interface/IOffering";
import * as styles from './scss/styles.module.scss';
import { inject, connect, injectable } from "react-inversify";
import { IOfferService } from "../../../../interface/IOfferService";
import { SPHttpClient } from '@microsoft/sp-http';
import { v4 as uuid } from 'uuid'; 

interface IMatchesProps extends RouteComponentProps<{}> {
  Offers:IOffering[];
  Book: IBooking;
  spHttpClient: SPHttpClient;
  setErrorMessage: Function;
}
interface IMatchesDependenciesProps{
  OfferService: IOfferService;
}
@injectable()
class Dependencies{
  @inject("OfferService") public readonly OfferService: IOfferService;
}

 class Matches extends React.Component<IMatchesProps & IMatchesDependenciesProps, {}> {
   constructor(props: IMatchesProps & IMatchesDependenciesProps) {
     super(props);
   }
  render()
   {
    let { Offers: offers, Book: book } = this.props;
    if (!offers)
      return <></>;
    else if (!offers.length)
      return <div id={styles.default.matchesLabel}>No Matches Found</div>;
    else {
      return (
        <div id={styles.default.matches}>
          <div id={styles.default.matchesLabel}>Your Matches</div>
          <div id={styles.default.allmatches}>{ offers.map((e, index) => {
        return (
          <OfferCard {...this.props} BookRequest={book} key={uuid()}
            IsOnUpdate={false}
            Offer={e} 
          ></OfferCard>
        )
      })}</div>
        </div>
      );
  
    }
   }
}

export default connect(Dependencies, (depsProps, ownProps: IMatchesProps) => ({
  Offers: ownProps.Offers,
  Book: ownProps.Book,
  OfferService: depsProps.OfferService,
  spHttpClient: ownProps.spHttpClient,
  history: ownProps.history,
  location: ownProps.location,
  match:ownProps.match
}))(Matches);