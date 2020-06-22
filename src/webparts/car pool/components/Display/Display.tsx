import * as React from "react";
import { inject, injectable, connect } from "react-inversify";
import { IBookingService } from "../../interface/IBookingService";
import { IBooking } from "../../interface/IBooking";
import { SPHttpClient } from '@microsoft/sp-http';
import { RouteComponentProps } from "react-router";
import BookCard from './../BookCard/BookCard';
interface IDisplayDependenciesProps
{
	BookingService: IBookingService;
}

interface IDisplayProps extends RouteComponentProps<{}> {
	id: string;
	spHttpClient:SPHttpClient
};

@injectable()
class Dependencies
{
	@inject("BookingService") public readonly BookingService:IBookingService;
}

interface IDisplayState {
	BookRides: Array<IBooking>;
	OfferRidesBooking: Array<IBooking>;
}
 class Display extends React.Component<IDisplayProps & IDisplayDependenciesProps, IDisplayState> {
	constructor(props) {
		super(props);
		this.state = {
			BookRides: new Array<IBooking>(),
			OfferRidesBooking:new Array<IBooking>()
		}
	}
	componentDidMount() {
		const { id,BookingService,spHttpClient } = this.props;
		
		BookingService.GetAllByUserId(parseInt(id),spHttpClient).then(res => {
			console.log(res);
			this.setState({ BookRides: res });
		});

		BookingService.GetAllOfferedRidesBooking(Number(id),spHttpClient).then(res => {
			this.setState({ OfferRidesBooking: res });
		});
	}
	setBookRides=(IsBookedRideChange:boolean)=>
	{       
		const {id,spHttpClient} = this.props;
		const { BookingService } = this.props;
		if(IsBookedRideChange){
		  BookingService.GetAllByUserId(Number(id),spHttpClient).then(res=>{
            this.setState({BookRides:res});
		  });
		}
		else{
			BookingService.GetAllOfferedRidesBooking(Number(id),spHttpClient).then(res=>{
				this.setState({OfferRidesBooking:res});
			});
		}
	}
	render() {
		const { BookRides: bookRides, OfferRidesBooking: offerRidesBooking } = this.state;
                  
		debugger;
		return (
			<div id="display" key="1">
				<div id="bookRide" key="1">
					<p>Booked rides</p>
					{bookRides.map(e => {
						return <BookCard {...this.props} IsOnUpdate={true} SetBookRides={this.setBookRides} Book={e}></BookCard>;
					})}
				</div>
				<div id="offerRide" key="2">
					<p>Offered rides</p>
					{offerRidesBooking.map(e => {
						return <BookCard {...this.props} IsOnUpdate={false} SetBookRides={this.setBookRides} Book={e}></BookCard>;
					})}
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
  location:ownProps.location
}))(Display);