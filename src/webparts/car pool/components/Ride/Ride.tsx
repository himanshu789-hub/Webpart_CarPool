import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IBookingService } from '../../interface/IBookingService';
import { IUserService } from '../../interface/IUserService';
import { IOfferService } from '../../interface/IOfferService';
import { SPHttpClient } from '@microsoft/sp-http';
import {ILocationSuggestService} from '../../interface/ILocationSuggestService';
import { injectable, inject, connect } from 'react-inversify';
import { ConstBookingService, ConstUserService, ConstOfferService, ConstLocationService } from '../../constant/injection';
import { IBooking } from '../../interface/IBooking';
import { IUser } from '../../interface/IUser';
import { IOffering } from '../../interface/IOffering';
import { User } from '../../model/User';
import { Offering } from '../../model/Offering';
import { Booking } from '../../model/Booking';
import { GoToPath } from '../../utilities/utilities';
import { CityPattern, NumberPlatePattern } from './locales/constant';
import { Vehicle } from '../../model/Vehicle';
import { IVehicle } from '../../interface/IVehicle';
import { ICoordinateInfo } from '../../interface/ICoordinateInfo';
import { DistanceService } from './../../service/DistanceService';
import {IDistanceService } from './../../interface/IDistanceService';
import { IBookingRequestInfo } from '../../interface/IBookingRequestInfo';
import { BookingStatus, Discount, VehicleType } from '../../constant/carpool';
import Cleave from 'cleave.js/react';
import Matches from './components/Matches/Matches';

interface TParams{
	id:string;
	offerId:string;
	bookingId: string;
}
interface IRideProps extends RouteComponentProps<TParams>{
	isOnBooking: boolean;
	isOnUpdate: boolean;
}
interface IRideDependenciesProps{
	BookingService: IBookingService;
	UserService: IUserService;
	OfferService: IOfferService;
	spHttpClient: SPHttpClient;
	LocationService: ILocationSuggestService;
	DistanceService: IDistanceService;
}

@injectable()
class Dependencies {
	@inject(ConstBookingService) public readonly BookingService: IBookingService;
	@inject(ConstUserService) public readonly UserService: IUserService;
	@inject(ConstOfferService) public readonly OfferService: IOfferService;
	@inject(ConstLocationService) public readonly LocationService: ILocationSuggestService;
	@inject("DistanceService") public readonly DistanceService: IDistanceService;
	
	
}
interface IRideState {
	Toogle: boolean;
	Booking: IBooking;
	ShowRides: boolean;
	IsSlideRight: boolean;
	User:IUser;
	FormMsg: string;
	ToMsg: string;
	TimeMsg: string;
	ViaPointMsg: string;
	SeatsMsg: string;
	PriceMsg: string;
	ShouldValidate: boolean;
	ShowOfferForm: boolean;
	DateMsg: string;
	IsOnUpdate: boolean;
	Offer: IOffering;
	FromResult: JSX.Element;
	ViaPointResult: Array<JSX.Element>;
	ToResult: JSX.Element;
	VehicleInfoMsg: string;
	matchOffer: Array<IOffering>;
	Vehicle: IVehicle;
	SourceCoords: ICoordinateInfo;
	DestinationCoords: ICoordinateInfo;
	ViaPointsCoords: ICoordinateInfo[];
}

class Ride extends React.Component<IRideProps & IRideDependenciesProps, IRideState> {
	constructor(props) {
		super(props);
		const { isOnBooking, isOnUpdate } = this.props;
		this.state = {
			Toogle: isOnBooking,
			ShowOfferForm: !isOnBooking,
			ShowRides: false,
			IsSlideRight: isOnBooking,
			User: new User(),
			FormMsg: '',
			PriceMsg: '',
			SeatsMsg: '',
			TimeMsg: '',
			ToMsg: '',
			ViaPointMsg: 'Please Enter A Intermidate Point',
			ShouldValidate: false,
			DateMsg: '',
			IsOnUpdate: isOnUpdate,
			Offer: new Offering(),
			FromResult: null,
			ViaPointResult: [<></>],
			ToResult: <></>,
			Booking: new Booking(),
			VehicleInfoMsg: '',
			matchOffer: null, Vehicle: new Vehicle(),
			DestinationCoords: null,
			SourceCoords: null,
			ViaPointsCoords:[]
		};
		this.AddMoreStops = this.AddMoreStops.bind(this);
		this.displayOfferRightPanel = this.displayOfferRightPanel.bind(this);
		this.offerSubmitValidate = this.offerSubmitValidate.bind(this);
		this.onBookingSubmit = this.onBookingSubmit.bind(this);
		this.onOfferSubmit = this.onOfferSubmit.bind(this);
		this.onViaPointInput = this.onViaPointInput.bind(this);
		this.removeStop = this.removeStop.bind(this);
		this.handleSlider = this.handleSlider.bind(this);
		this.onInputChange = this.onInputChange.bind(this);
		this.validateBookingSubmit = this.validateBookingSubmit.bind(this);
		this.handleAddressSelect = this.handleAddressSelect.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
	}

	componentDidMount() {
		const {match,isOnUpdate,isOnBooking,OfferService,BookingService,UserService,spHttpClient} = this.props;
		const {params} = match;
		const { offerId, id, bookingId } = params;
		switch (isOnUpdate) {
			case true:
				{
					switch (isOnBooking) {
						case true:
							{
								BookingService.GetById(parseInt(bookingId),spHttpClient).then((response) => {
									let book: IBooking = { ...response };
										
										UserService.GeyUserById(book.PassengerRef,spHttpClient)
											.then((response) => {
												const user:IUser = {...response};
												this.setState({
													User: {...user}
												});
											});
										this.setState({
											Booking: {...book}
										});
									})
									.catch((error) => {
										console.log(error);
									});
							}
							break;
						case false:
							{
								OfferService.GetById(parseInt(offerId),spHttpClient)
									.then((response) => {
										const Offer: IOffering = response;
										this.setState({
											Offer: Offer,
											ViaPointResult: Offer.ViaPoints.map((e) => <></>),
										});
									return	UserService.GeyUserById(Offer.UserId,spHttpClient);
									}).then(response=>{
										this.setState({User:{...response}});
									})
									.catch((error) => {
										//
									});
							}
							break;
					}
				}
				break;
			case false:
				{
					switch (isOnBooking) {
						case true:
							{
								UserService.GeyUserById(parseInt(id),spHttpClient)
									.then((response) => {
										const user: IUser = { ...response };
										this.setState({
											User: {...user},
										});
									})
								this.setState({
									Booking: {...new Booking()},
								});
							}
							break;
						case false:
							{
								UserService.GeyUserById(parseInt(id),spHttpClient)
									.then((response) => {
										const user:IUser = response;
										this.setState({
											User: {...user},
										});
									})
									.catch((error) => {
										//error loading page
									});
								this.setState({ Offer:  new Offering() });
							}
							break;
					}
				}
				break;
		}
	}

	handleSlider(event) {
		const { Toogle } = this.state;
		const { history,location,match:{params:{id}} } = this.props;
        const {pathname} = location;
		if (Toogle) {
			this.setState({
				Toogle: false,
				IsSlideRight: false,
				ShowOfferForm: true,
				ShowRides: false,
			});
			debugger;
		history.push(GoToPath.RideOffer(parseInt(id)));
		} else {
			this.setState({
				Toogle: true,
				IsSlideRight: true,
				ShowOfferForm: false,
				ShowRides: false,
			});
			debugger;
		history.push(GoToPath.RideBook(parseInt(id)));
		}
	}

	handleAddressSelect(event) {
      const {target} =  event;
	  const {dataset,textContent} = target;
      const {stopindex, context, index } = dataset;
	    const { isOnBooking } = this.props;
		
		if (context == 'viapoint') {
			this.setState((state) => {
				return {
					ViaPointResult: state.Offer.ViaPoints.map((e) => <></>),
					Offer: {
						...state.Offer,
						ViaPoints: [
							...state.Offer.ViaPoints.map((currValue, index) => {
								if (index == stopindex) return {...state.Offer.ViaPoints[stopindex],LocationName: textContent};
								else return currValue;
							}),
						],
					},
				};
			});
		} else if (context == 'Source') {
			if (isOnBooking)
			{
				this.setState((state) => {
					return { FromResult: <></>, Booking: { ...state.Booking, Source: textContent } }
				});
				}
			else
			{
				this.setState((state) => {
					return { FromResult: <></>, Offer: { ...state.Offer, Source: textContent  } }
				});
		}
	} 
		else {
			if (isOnBooking)
				this.setState((state) => {
					return { ToResult: <></>, Booking: { ...state.Booking, Destination:textContent } };
				});
			else
				this.setState((state) => {
					return {
            ToResult: <></>,
            Offer: {
              ...state.Offer,Destination: textContent,
            },
          };
			 });
		}
	}

	async onViaPointInput(event) {
		let { name, value } = event.target;
		const {LocationService} = this.props;
		name = name.substring(1);
		const indexValue: number = Number(name);
		this.setState(
			(state) => {
				return {
					Offer: {
						...state.Offer,
						ViaPoints: [
							...state.Offer.ViaPoints.filter((e, index) => {
								if (index < indexValue) {
									if (e.Place.length == 0) return ' ';
									else return e;
								}
							}),
							{...state.Offer.ViaPoints[indexValue],LocationName:value},
							...state.Offer.ViaPoints.filter((currValue, index) => {
								if (index > indexValue) {
									if (currValue.Place.length == 0) return ' ';
									else return currValue;
								}
							}),
						],
					},
				};
			},
			() => {
				console.log(this.state.Offer.ViaPoints);
			},
		);
		if (value.length != 0) {
			
			debugger;
		const response = LocationService.GetSuggestion(value).then(response => {
			debugger;
          var addresses = response.map(e => e.Name);
          this.setState(state => {
            return {
              ViaPointResult: [
                ...state.ViaPointResult.filter((e, index) => {
                  if (index < indexValue) return <></>;
                }),
                <>
                  {addresses.map((e, index) => (
                    <span
                      key={index}
                      data-stopindex={indexValue}
                      data-context='viapoint'
                      className='address'
                      onClick={this.handleAddressSelect}
                    >
                      {e}
                    </span>
                  ))}
                </>,
                ...state.ViaPointResult.filter((e, index) => {
                  if (index > indexValue) return <></>;
                }),
              ],
            };
          });
        }
      );
	} else {
			this.setState((state) => {
				return {
					ViaPointResult: [
						...state.ViaPointResult.filter((e, index) => {
							if (index < indexValue) return e;
						}),
						<></>,
						...state.ViaPointResult.filter((e, index) => {
							if (index > indexValue) return e;
						}),
					],
				};
			});
		}
	}
	AddMoreStops() {
		this.setState((state) => {
			return {
			// 	Offer: { ...state.Offer, ViaPoints: [...state.Offer.ViaPoints, {...new LocationDTO(),LocationName:''}] },
			// 	ViaPointResult: [...state.ViaPointResult, <></>], ViaPointsCoords: [...state.ViaPointsCoords, { Longitude:'',Lattitude:''}]
			 };
		});
	}
	removeStop(event) {
		let index: number = Number(event.target.dataset.key);
		this.setState((state) => {
			return {
				Offer: {
					...state.Offer,
					ViaPoints: [...state.Offer.ViaPoints].filter((item, itemIndex) => {
						return itemIndex != index;
					}),
				},
				ViaPointResult: [...state.ViaPointResult].filter((item, itemIndex) => {
					return itemIndex != index;
				}),
			};
		});
	}

	offerSubmitValidate(): boolean {
		let validateResult: boolean = false;
		const {
			IsOnUpdate: isOnUpdate,
			Offer,
			Offer: { ViaPoints },Vehicle
		} = this.state;

		if (Offer.Source.length == 0 || !CityPattern.test(Offer.Source)) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });

		if (Offer.Destination.length == 0 || !CityPattern.test(Offer.Destination)) {
			validateResult = true;
			this.setState({ ToMsg: 'Please Enter Destination' });
		} else this.setState({ ToMsg: '' });

		for (let i = 0; i < ViaPoints.length; i++) {
			if (ViaPoints[i].Place.length == 0 || !CityPattern.test(ViaPoints[i].Place)) {
				this.setState({ ShouldValidate: true });
				validateResult = true;
			}
		}

		if (Offer.StartTime == null) {
			validateResult = true;
			this.setState({ DateMsg: 'Please Select Date And Ride Start Time' });
		} else {
			this.setState({ DateMsg: '' });
		}

		if (Offer.SeatsOffered == 0) {
			validateResult = true;
			this.setState({ SeatsMsg: 'Select Seats' });
		} else this.setState({ SeatsMsg: '' });

		if (Offer.PricePerKM == 0) {
			validateResult = true;
			this.setState({ PriceMsg: 'Enter Price' });
		} else this.setState({ PriceMsg: '' });
		//Vehicle Things Validation
		if (
			Vehicle.NumberPlate == null ||
			Vehicle.NumberPlate == '' ||
			!NumberPlatePattern.test(Vehicle.NumberPlate)
		) {
			validateResult = true;
			this.setState({ VehicleInfoMsg: 'Registration Number' });
		} else {
			this.setState({ VehicleInfoMsg: '' });
		}
		return validateResult;
	}
	async	onOfferSubmit(event) {

		event.preventDefault();

		const {
      Offer: Offer,
      Offer: { ViaPoints },
      IsOnUpdate: IsOnUpdate,SourceCoords,DestinationCoords,ViaPointsCoords
    } = this.state;
		const {LocationService,OfferService,history,location,DistanceService,spHttpClient,match:{params:{id}}} = this.props;
		const {pathname} = location;
		if (this.offerSubmitValidate())
			return;
		for (var i = 0; i < ViaPointsCoords.length; i++)
		{
		
			if (i == 0)
			{
				DistanceService.GetDistance(SourceCoords, ViaPointsCoords[i]).then(response => {
					Offer.ViaPoints[0].DistanceFromLastPlace = response.Distance;
				});		
			}
		else	if (i == ViaPointsCoords.length - 1) {
			DistanceService.GetDistance(SourceCoords, ViaPointsCoords[i]).then(response => {
				Offer.DistanceFromLastPlace = response.Distance;
			});		
			}
			else {
			
				DistanceService.GetDistance(ViaPointsCoords[i], ViaPointsCoords[i+1]).then(response => {
					Offer.ViaPoints[i+1].DistanceFromLastPlace = response.Distance;
				});			 
           }
		}
		if (IsOnUpdate) {
			OfferService.Update(Offer,spHttpClient)
				.then((respose) => {
					if (respose)
					{
						 history.push(GoToPath.Display(parseInt(id)));
					}
					else return <>Sorry</>;
				});
		} else {
			debugger;
			OfferService.Create(Offer,spHttpClient).then((response) => {
			 history.push(GoToPath.Home(parseInt(id)));
			});
		}
	}
	validateBookingSubmit(): boolean {
		let validateResult: boolean = false;
		const {
			Booking: { Source, Destination, DateTimeOfBooking:DateTime, SeatsRequired },
		} = this.state;
		if (Source.length == 0) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });

		if (Destination.length == 0) {
			validateResult = true;
			this.setState({ ToMsg: 'Please Enter Destination' });
		} else this.setState({ ToMsg: '' });

		if (DateTime == null) {
			validateResult = true;
			this.setState({ DateMsg: 'Please Enter Valid Date' });
		} else this.setState({ DateMsg: '' });

		if (SeatsRequired == 0) {
			validateResult = true;
			this.setState({ SeatsMsg: 'Number of Seats To Book' });
		} else this.setState({ SeatsMsg: '' });
		return validateResult;
	}

	async onBookingSubmit(event) {
		event.preventDefault();
		if (!this.validateBookingSubmit()) {
			const {
				Booking: { Source, Destination, SeatsRequired },
			} = this.state;
			const { LocationService, OfferService, spHttpClient } = this.props;
			const BookingRequestInfo: IBookingRequestInfo = {
				Destination: Destination,
				SeatsRequired: SeatsRequired,
				Source:Source
			}
			OfferService.GetByEndPonits(BookingRequestInfo,spHttpClient).then((response) => {
				this.setState({ matchOffer: [...response] });
			});
		}
	}
	
	displayOfferRightPanel(event) {
		event.preventDefault();
		this.setState((state) => {
			return { ShowOfferForm: !state.ShowOfferForm };
		});
	}
	async onInputChange(event) {
		const { Toogle } = this.state;
		const { name, value } = event.target;
        const {LocationService,BookingService} = this.props;
		if (Toogle) {
			if (name == "Source" || name == "Destination")
				this.setState((state) => {
					return {
						Booking: { ...state.Booking, [name]: { ...state.Booking[name], LocationName: value } },
					};
				});
			else {
				this.setState((state) => {
					return { Booking: { ...state.Booking, [name]: value } };
				})
			}
		} else {
			if (name == 'NumberPlate') {
				this.setState((state) => {
					return { Vehicle: { ...state.Vehicle, [name]: value } }
				});
			} else
				this.setState((state) => {
					return {
						Offer: { ...state.Offer, [name]: value },
					};
				});
		}
		if (name == 'Source' || name == 'Destination') {
			if (value.length == 0 && name == 'Destination') {
				this.setState({ ToResult: <></> });
				return;
			}
			if (value.length == 0 && name == 'Source') {
				this.setState({ FromResult: <></> });
				return;
			}

	
			const response = await LocationService.GetSuggestion(value); 
			if (name == 'Source') {
				var addresses = response.map((e, index) => (
					<span data-index={index} data-context='Source' key={index} onClick={this.handleAddressSelect}>
						{e.Name}
					</span>
				));
				this.setState({ FromResult: <>{addresses}</> });
			} else {
				var addresses = response.map((e, index) => (
					<span
						data-index={index}
						key={index}
						data-context='Destination'
						onClick={this.handleAddressSelect}
					>
						{e.Name}
					</span>
				));
				this.setState({ ToResult: <>{addresses}</> });
			}
		}
	}
	handleSelection(event) {
		const { value } = event.target;

		this.setState((state) => {
			return {
				Offer: {
					...state.Offer,
				},
			}
		});
	}

	render() {
		const {
			ViaPointMsg,
			FormMsg,
			ToMsg,
			PriceMsg,
			TimeMsg,
			ShowOfferForm: showOfferForm,
			ShouldValidate: shouldValidate,
			Toogle,
			DateMsg: dateMsg,
			IsSlideRight: isSlideRight,
			ShowRides: showRides,
			FromResult: fromResult,
			ViaPointResult,
			ToResult: toResult,
			Booking,
			Offer,
			Offer: { ViaPoints },
			VehicleInfoMsg,
			Vehicle,
			SeatsMsg,
			matchOffer
		} = this.state;
		var totalSeat = [];
		for (let i = 0; i <Vehicle.Capacity; i++) {
			totalSeat.push(' ');
		}
       const {match:{params:{bookingId}}} = this.props;
		return (
			<div className='ride' key={1}>
				<form className={'rideForm '.concat(Toogle ? 'formWidthLess' : 'formWidthMore')}>
					<div className='rideContent' key={1}>
						<div id='rideHead'>
							<div id='top'>
								<h1>{Toogle ? 'Book a Ride' : 'Offer a Ride'}</h1>
								<input type='checkbox' checked={isSlideRight} onChange={this.handleSlider} disabled={bookingId!=undefined?true:false}/>
							</div>
							<p>we get you the matches asap!</p>
						</div>
						<div id='rideFormBar'>
							<div className='rideFormcontent positionRelative'>
								<label>
									From <span className='msg'>{FormMsg}</span>
								</label>
								<input
									type='text'
									name='Source'
									required
									autoComplete='off'
									placeholder=' '
									id='from'
									disabled={bookingId!=undefined?(Booking.Status==BookingStatus.ACCEPTED):false}
									value={Toogle ? Booking.Source : Offer.Source}
									onChange={this.onInputChange}
								/>
								<section className='suggestionResult'>{fromResult}</section>
							</div>
							<div className='rideFormcontent positionRelative'>
								<label>
									To <span className='msg'>{ToMsg}</span>
								</label>{' '}
								<input
									type='text'
									name='Destination'
									required
									id='to'
									placeholder=' '
									
									autoComplete='off'
									value={Toogle ? Booking.Destination : Offer.Destination}
									onChange={this.onInputChange}
								/>
								<section className='suggestionResult'>{toResult}</section>
							</div>
							<div className='rideFormcontent'>
								<label>
									Time <span className='msg'>{dateMsg}</span>
									<div className='DateTimePicker'>
									<Cleave  placeholder="MM/YY" options={{ date: true, datePattern: ["m", "d"] }} onChange={this.onInputChange} className="form-field"/>
									</div>
								</label>
							</div>
							{Toogle ? (
								<>
									<div className='rideFormcontent'>
										<label>
											Seats Required : <span className='msg'>{SeatsMsg}</span>
										</label>
										<input
											type='text'
											name='SeatsRequired'
											disabled={bookingId != undefined ? Booking.Status == BookingStatus.ACCEPTED  : false}
											value={Booking.SeatsRequired == 0 ? '' : Booking.SeatsRequired}
											placeholder=' '
											onChange={this.onInputChange}
										/>
									</div>

									<button type='button' className='submit-button' onClick={this.onBookingSubmit}>
										Submit
									</button>
								</>
							) : (
									<div className="rideFormContent">
									<select name="Discount">
											<option value={0} selected={Offer.Discount==Discount.ZERO} onClick={()=>{this.setState((state)=>{return {Offer:{...state.Offer,Discount:0}}})}}>ZERO</option>
											<option value={5} selected={Offer.Discount == Discount.FIVE } onClick={() => { this.setState((state) => { return { Offer: { ...state.Offer, Discount: 5 } } }) }}>FIVE</option>
											<option value={10} selected={Offer.Discount == Discount.TEN } onClick={() => { this.setState((state) => { return { Offer: { ...state.Offer, Discount: 10 } } }) }}>TEN</option>
											<option value={20} selected={Offer.Discount == Discount.TWENTY } onClick={() => { this.setState((state) => { return { Offer: { ...state.Offer, Discount: 20 } } }) }}>TWENTY</option>
									</select>
									</div>
								)}
						</div>
						{Toogle ? (
							''
						) : (
								<button id='next' onClick={this.displayOfferRightPanel}>
									Next &lt;&lt;
							</button>
							)}
					</div>

					{showOfferForm ? (
						<>
							<div className='rideFormContinue' key={2}>
								<div id='rideHead' key={1}>
									<div id='top' key={1}>
										<h1>{'Offer a Ride'}</h1>
										<input type='checkbox' checked={Toogle} onClick={this.handleSlider} />
									</div>
									<p>we get you the matches asap!</p>
								</div>
								<div id='viapoints' key={2}>
									<div key={0} className='stops'>
										<label>
											Stop {1}{' '}
											<span className='msg'>
												{shouldValidate ? (ViaPoints[0].Place.length == 0 ? ViaPointMsg : '') : ''}
											</span>
										</label>
										<input
											type='text'
											placeholder=' '
											autoComplete='off'
											className='extras'
											required
											name={'_0'}
											value={ViaPoints[0].Place || ''}
											onChange={this.onViaPointInput}
										/>
										<section className='suggestionResult'>{ViaPointResult[0]}</section>
									</div>
									{ViaPoints.map((currentValue, index) => {
										if (index == 0) return <></>;
										return (
											<div key={index} className='stops'>
												<label className='minus' onClick={this.removeStop}>
													<i className='fa fa-times' data-key={index + ''}></i>
												</label>
												<label>
													Stop {index + 1}{' '}
													<span className='msg'>
														{shouldValidate ? (ViaPoints[index].Place.length == 0 ? ViaPointMsg : '') : ''}
													</span>
												</label>
												<input
													type='text'
													placeholder=' '
													className='extras'
													autoComplete='off'
													required
													name={'_' + index}
													value={currentValue.Place || ''}
													onChange={this.onViaPointInput}
												/>
												<section className='suggestionResult'>{ViaPointResult[index]}</section>
											</div>
										);
									})}
								</div>
								<label className='plus' onClick={this.AddMoreStops}>
									<i className='fa fa-plus'></i>
								</label>
								<div className='rideFormcontent VehicleInfo'>
									<label>
										Vehicle Information <span className='msg'>{VehicleInfoMsg}</span>
									</label>
									<p>
										<span>
											<input
												type='text'
												placeholder='Number Plate'
												name='NumberPlate'
												value={Vehicle.NumberPlate || ''}
												onChange={this.onInputChange}
											/>
										</span>
										<span>
											<select name='VehicleType' onChange={this.handleSelection}>
												{Object.values(VehicleType).map((e) => (
													<option value={e}>{e}</option>
												))}
											</select>
										</span>
									</p>
								</div>
								<div id='sectionB'>
									<label>
										Available Seats <span className='msg'>{SeatsMsg}</span>{' '}
									</label>
									<div className='seats'>
										{totalSeat.map((e, index) => {
											return (
												<div>
													<input
														type='radio'
														value={index + 1}
														name='seats'
														onClick={() =>
															this.setState((state) => {
																return { Offer: { ...Offer, SeatsOffered: index + 1 } };
															})
														}
														checked={Offer.SeatsOffered == index + 1 ? true : false}
													/>
													<label>{index + 1}</label>
												</div>
											);
										})}
									</div>
								</div>
								<div id='offerPrice'>
									<label>
										Price <span className='msg'>{PriceMsg}</span>
									</label>
									<input
										type='text'
										name='PricePerKM'
										value={Offer.PricePerKM == 0 ? '' : Offer.PricePerKM}
										required
										onChange={this.onInputChange}
										placeholder='Enter Ride Price'
									/>
								</div>
								<br />
								<button
									type='submit'
									form='rideForm'
									className='submit-button'
									onClick={this.onOfferSubmit}
								>
									Submit
								</button>
							</div>
						</>
					) : (
							<></>
						)}
				</form>
				{<Matches {...this.props} Offers={matchOffer} Book={matchOffer == null ? null : Booking}  />}
			</div>
		);
	}
}

export default connect(Dependencies, (deps, ownProps: IRideProps) => ({
  UserService: deps.UserService,
  OfferService: deps.OfferService,
  BookingService: deps.BookingService,
  isOnBooking:ownProps.isOnBooking,
  isOnUpdate:ownProps.isOnUpdate,
  LocationService:deps.LocationService
}))(Ride);