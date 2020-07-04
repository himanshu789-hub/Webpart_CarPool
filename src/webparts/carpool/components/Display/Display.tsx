import * as React from "react";
import { inject, injectable, connect } from "react-inversify";
import { IBookingService } from "../../interface/IBookingService";
import { IBooking } from "../../interface/IBooking";
import { SPHttpClient } from '@microsoft/sp-http';
import { RouteComponentProps } from "react-router";
import BookCard from './../BookCard/BookCard';
import { IOfferService } from "../../interface/IOfferService";
import {v4 as uuid} from "uuid";
import * as styles from './scss/styles.module.scss';

interface IDisplayDependenciesProps
{
	BookingService: IBookingService;
	OfferService: IOfferService;
}

interface IDisplayProps extends RouteComponentProps<{}> {
	id: string;
	spHttpClient: SPHttpClient;
	setErrorMessage: Function;
};

@injectable()
class Dependencies
{
	@inject("BookingService") public readonly BookingService: IBookingService;
	@inject("OfferService") public readonly OfferService: IOfferService;
}

interface IDisplayState {
	BookRides: IBooking[];
	OfferRidesBooking: IBooking[];
}
class Display extends React.Component<IDisplayProps & IDisplayDependenciesProps, IDisplayState> {
	constructor(props) {
		super(props);
		this.state = {
			BookRides: [],
			OfferRidesBooking: []
		}
	}
	async componentDidMount() {
		const { id, BookingService, spHttpClient, OfferService,setErrorMessage } = this.props;
		
		BookingService.GetAllByUserId(parseInt(id), spHttpClient).then(res => {
			console.log(res);
			this.setState({ BookRides: [ ...res ] });
		});
		let Ids: number[] = await OfferService.GetAllOnlyIdByUserId(parseInt(id), true, spHttpClient);
		Ids = [...Ids, ...await OfferService.GetAllOnlyIdByUserId(parseInt(id), false, spHttpClient)];
		debugger;
		if(Ids.length)
		BookingService.GetAllOfferedRidesBooking(Ids, spHttpClient).then(res => {
			this.setState({ OfferRidesBooking: [ ...res ] });
		}).catch(e => {
			setErrorMessage(true, (e as Error).message);
		});
	}

	setBookRides = async (IsBookedRideChange:boolean)=>
	{       
		const {id,spHttpClient} = this.props;
		const { BookingService,OfferService,setErrorMessage } = this.props;
		if(IsBookedRideChange){
		  BookingService.GetAllByUserId(Number(id),spHttpClient).then(res=>{
			  this.setState({ BookRides: [...res ]});
		  });
		}
		else {
			let Ids: number[] = await OfferService.GetAllOnlyIdByUserId(parseInt(id), true, spHttpClient);
	     	Ids = [...Ids, ...await OfferService.GetAllOnlyIdByUserId(parseInt(id), false, spHttpClient)];
		if(Ids.length)
			BookingService.GetAllOfferedRidesBooking(Ids, spHttpClient).then(res => {
				this.setState({ OfferRidesBooking: [ ...res ] });
			}).catch(e => {
			setErrorMessage(true, (e as Error).message);
			});
		}
	}
	render() {
		const { BookRides: bookRides, OfferRidesBooking: offerRidesBooking } = this.state;
		debugger;
		return (
			<div id={styles.default.display}>
				<div id={styles.default.bookRide}>
					<p>Booked rides</p>
					{bookRides.map(e =>
						 <BookCard key={uuid()} {...this.props} IsOnUpdate={true} SetBookRides={this.setBookRides} Book={e}></BookCard>
					)}
				</div>
				<div id={styles.default.offerRide}>
					<p>Offered rides</p>
					{...offerRidesBooking.map(e => 
				         <BookCard key={uuid()} {...this.props} IsOnUpdate={false} SetBookRides={this.setBookRides} Book={e}></BookCard>
					)}
				</div>
			</div>
		);
	}
}

export default connect(Dependencies, (deps, ownProps: IDisplayProps) => ({
  BookingService: deps.BookingService,
  id: ownProps.id,
  match: ownProps.match,
  history:ownProps.history,
  location: ownProps.location,
  OfferService:deps.OfferService
}))(Display);