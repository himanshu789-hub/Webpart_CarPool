import * as React from "react";
import { IBooking } from "../../../../interface/IBooking";
import { RouteComponentProps } from "react-router";
import OfferCard from "../../../OfferCard/OfferCard";
import { IOffering } from "../../../../interface/IOffering";

interface IMatches {
  Offers: Array<IOffering>;
  Book: IBooking;
}

function Matches(props: IMatches) {
  let { Offers: offers, Book: book } = props;
  if (offers == null && book == null)
    return <></>;

  else {
    const offersRender = offers.map((e, index) => {
      return (
        <OfferCard {...this.props} BookRequest={book}
          IsOnUpdate={false}
          Offer={e}
        ></OfferCard>
      );
    });
    return (
      <div id="matches">
        <div id="matchesLabel">Your Matches</div>
        <div id="allmatches">{offersRender}</div>
      </div>
    );

  }
}

export default Matches;
