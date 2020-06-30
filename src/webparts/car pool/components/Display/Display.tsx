import * as React from "react";
import { BookDTO, IBookDTO } from "../../model/Booking";
import BookCard from "../BookCard/BookCard";
import IBookingService from "../../service/BookingService";
import { inject, injectable, connect } from "react-inversify";
import './css/styles.css';

interface IDisplayDependenciesProps
{
	BookingService: IBookingService;
}

interface IDisplayProps  {
	history: any;
	match:any;
	location:any;
	id: string;
};

@injectable()
class Dependencies
{
	@inject("BookingService") public readonly BookingService:IBookingService;
}

interface IDisplayState {
	BookRides: Array<BookDTO>;
	OfferRidesBooking: Array<BookDTO>;
}
 class Display extends React.Component<IDisplayProps & IDisplayDependenciesProps, IDisplayState> {
	constructor(props) {
		super(props);
		this.state = {
			BookRides: new Array<IBookDTO>(),
			OfferRidesBooking:new Array<IBookDTO>()
		}
	}
	componentDidMount() {
		const { id,BookingService } = this.props;
		
		BookingService.GetAllByUserId(Number(id)).then(res => {
			console.log(res.data);
			this.setState({ BookRides: res.data });
		});

		BookingService.GetAllOfferedRidesBooking(Number(id)).then(res => {
			this.setState({ OfferRidesBooking: res.data });
		});
	}
	setBookRides=(IsBookedRideChange:boolean)=>
	{       
		const {id} = this.props;
		const { BookingService } = this.props;
		if(IsBookedRideChange){
		  BookingService.GetAllByUserId(Number(id)).then(res=>{
            this.setState({BookRides:res.data});
		  });
		}
		else{
			BookingService.GetAllOfferedRidesBooking(Number(id)).then(res=>{
				this.setState({OfferRidesBooking:res.data});
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