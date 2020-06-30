import * as React from 'react';
import './css/styles.css';
import { BookingStatus, VehicleType, Discount } from '../../constant/carpool';
import IOfferDTO, { OfferDTO } from '../../model/Offering';
import { UserDTO } from '../../model/User';
import Matches from './components/Matches/Matches';
import { CityPattern, NumberPlatePattern } from './locales/constant';
import BookDTO,{ IBookDTO } from '../../model/Booking';
import DateTimePicker from 'react-datetime-picker';
import Vehicle from '../../model/Vehicle';
import ILocationDTO,{LocationDTO} from '../../model/Location';
import IUserService from '../../service/UserService';
import { injectable, inject, connect } from 'react-inversify';
import IOfferService from '../../service/OfferService';
import IBookingService from '../../service/BookingService';
import { ConstBookingService, ConstUserService, ConstOfferService,ConstAutoSuggestService, ConstLocationService, } from '../../constant/injection';
import IUserDTO from '../../model/User';
import { GoToPath } from '../../utilities/utilities';
import IAutoSuggestService from '../../service/LocationSuggestService';
import ILocationService from '../../service/LocationSuggestService';
import {IBookingRequestInfo} from '../../interface/IUpdateLocationInfo';
interface IRideProps {
	isOnBooking: boolean;
	history: any;
	match: any;
	location: any;
	isOnUpdate: boolean;
}
interface IRideDependenciesProps{
	BookingService: IBookingService;
	UserService: IUserService;
	OfferService: IOfferService;
	AutoSuggestService:IAutoSuggestService;
	LocationService:ILocationService;
}

@injectable()
class Dependencies {
	@inject(ConstBookingService) public readonly BookingService: IBookingService;
	@inject(ConstUserService) public readonly UserService: IUserService;
	@inject(ConstOfferService) public readonly OfferService: IOfferService;
	@inject(ConstAutoSuggestService) public readonly AutoSuggestService: IAutoSuggestService;
	@inject(ConstLocationService) public readonly LocationService: ILocationService;
	
}
interface IRideState {
	Toogle: boolean;
	Booking: IBookDTO;
	ShowRides: boolean;
	IsSlideRight: boolean;
	User: UserDTO;
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
	Offer: IOfferDTO;
	FromResult: JSX.Element;
	ViaPointResult: Array<JSX.Element>;
	ToResult: JSX.Element;
	VehicleInfoMsg: string;
	matchOffer: Array<IOfferDTO>;
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
			User: new UserDTO(),
			FormMsg: '',
			PriceMsg: '',
			SeatsMsg: '',
			TimeMsg: '',
			ToMsg: '',
			ViaPointMsg: 'Please Enter A Intermidate Point',
			ShouldValidate: false,
			DateMsg: '',
			IsOnUpdate: isOnUpdate,
			Offer: {
				...new OfferDTO(),
				ViaPoints: [{...new LocationDTO(),LocationName:''}],
				Vehicle: { Capacity: 0, NumberPlate: '', Type:Object.keys[0] },
				Source:{...new LocationDTO(),LocationName:''},
				Destination:{...new LocationDTO(),LocationName:''},
				CurrentLocation:{...new LocationDTO(),LocationName:''}
			},
			FromResult: null,
			ViaPointResult: [<></>],
			ToResult: <></>,
			Booking: {...new BookDTO(),	Source:{...new LocationDTO(),LocationName:''},
				Destination:{...new LocationDTO(),LocationName:''},
			},
			VehicleInfoMsg: '',
			matchOffer: null,
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
		const {match,isOnUpdate,isOnBooking,OfferService,BookingService,UserService} = this.props;
		const {params} = match;
		const { offerId, id, bookingId } = params;
		switch (isOnUpdate) {
			case true:
				{
					switch (isOnBooking) {
						case true:
							{
								BookingService.GetById(bookingId).then((response) => {
										let book: IBookDTO = response.data;
										
										UserService.GeyUserById(book.UserId)
											.then((response) => {
												const user:UserDTO = response.data;
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
								OfferService.GetById(offerId)
									.then((response) => {
										const Offer: OfferDTO = response.data;
										this.setState({
											Offer: Offer,
											ViaPointResult: Offer.ViaPoints.map((e) => <></>),
										});
									return	UserService.GeyUserById(Offer.UserId);
									}).then(response=>{
										this.setState({User:{...response.data}});
									})
									.catch((error) => {
										console.log(error);
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
								UserService.GeyUserById(id)
									.then((response) => {
										const user:IUserDTO = response.data;
										this.setState({
											User: {...user},
										});
									})
								this.setState({
									Booking: {...new BookDTO(),Source:{...new LocationDTO(),LocationName:''},Destination:{...new LocationDTO(),LocationName:''}},
								});
							}
							break;
						case false:
							{
								UserService.GeyUserById(id)
									.then((response) => {
										const user:IUserDTO = response.data;
										this.setState({
											User: {...user},
										});
									})
									.catch((error) => {
										//error loading page
									});
								this.setState({Offer: {...new OfferDTO(),Source:{...new LocationDTO(),LocationName:''},CurrentLocation:{...new LocationDTO(),LocationName:''},Destination:{...new LocationDTO(),LocationName:''}}});
							}
							break;
					}
				}
				break;
		}
	}

	handleSlider(event) {
		const { Toogle } = this.state;
		const { history,location } = this.props;
        const {pathname} = location;
		if (Toogle) {
			this.setState({
				Toogle: false,
				IsSlideRight: false,
				ShowOfferForm: true,
				ShowRides: false,
			});
			debugger;
		history.push(GoToPath(pathname,'ride/offer'));
		} else {
			this.setState({
				Toogle: true,
				IsSlideRight: true,
				ShowOfferForm: false,
				ShowRides: false,
			});
			debugger;
		history.push(GoToPath(pathname,'ride/book'));
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
				{this.setState((state) => {
					return { FromResult: <></>, Booking: { ...state.Booking, Source: {...state.Booking.Source,LocationName:textContent}} } })
				}
			else
			{
				this.setState((state) => {
					return { FromResult: <></>, Offer: { ...state.Offer, Source: {...state.Offer.Source,LocationName :textContent } } }
				});
		}
	} 
		else {
			if (isOnBooking)
				this.setState((state) => {
					return { ToResult: <></>, Booking: { ...state.Booking, Destination: {...state.Booking.Destination,LocationName:textContent} } };
				});
			else
				this.setState((state) => {
					return {
            ToResult: <></>,
            Offer: {
              ...state.Offer,
              Destination: {
                ...state.Offer.Destination,
                LocationName: textContent,
              },
            },
          };
				});
		}
	}
	async onViaPointInput(event) {
		let { name, value } = event.target;
		const {AutoSuggestService} = this.props;
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
									if (e.LocationName.length == 0) return ' ';
									else return e;
								}
							}),
							{...state.Offer.ViaPoints[indexValue],LocationName:value},
							...state.Offer.ViaPoints.filter((currValue, index) => {
								if (index > indexValue) {
									if (currValue.LocationName.length == 0) return ' ';
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
		const response = AutoSuggestService.GetSuggestion(value).then(response => {
			debugger;
          var addresses = response.data.resourceSets[0].resources[0].value.map(e => e.address);
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
                      {e.addressLine}
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
				Offer: { ...state.Offer, ViaPoints: [...state.Offer.ViaPoints, {...new LocationDTO(),LocationName:''}] },
				ViaPointResult: [...state.ViaPointResult, <></>],
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
			Offer: { ViaPoints },
		} = this.state;

		if (Offer.Source.LocationName.length == 0 || !CityPattern.test(Offer.Source.LocationName)) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });

		if (Offer.Destination.LocationName.length == 0 || !CityPattern.test(Offer.Destination.LocationName)) {
			validateResult = true;
			this.setState({ ToMsg: 'Please Enter Destination' });
		} else this.setState({ ToMsg: '' });

		for (let i = 0; i < ViaPoints.length; i++) {
			if (ViaPoints[i].LocationName.length == 0 || !CityPattern.test(ViaPoints[i].LocationName)) {
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

		if (Offer.MaxOfferSeats == 0) {
			validateResult = true;
			this.setState({ SeatsMsg: 'Select Seats' });
		} else this.setState({ SeatsMsg: '' });

		if (Offer.PricePerKM == 0) {
			validateResult = true;
			this.setState({ PriceMsg: 'Enter Price' });
		} else this.setState({ PriceMsg: '' });
		if (
			Offer.Vehicle.NumberPlate == null ||
			Offer.Vehicle.NumberPlate == '' ||
			!NumberPlatePattern.test(Offer.Vehicle.NumberPlate)
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
      IsOnUpdate: IsOnUpdate,
    } = this.state;
		const {LocationService,OfferService,history,location} = this.props;
		const {pathname} = location;
		if (this.offerSubmitValidate()) return;

		let newOffer: OfferDTO = { ...new OfferDTO(), Vehicle: new Vehicle(), Source: new LocationDTO(), Destination: new LocationDTO(), ViaPoints: new Array<ILocationDTO>() };
		await LocationService.GetCoordinates(Offer.Source.LocationName)
			.then((response) => {
				const coordinates = response.data.resourceSets[0].resources[0].point.coordinates;
				newOffer.Source.LocationName = Offer.Source.LocationName;
				newOffer.Source.Lattitude = coordinates[0];
				newOffer.Source.Longitude = coordinates[1];
			});
		await LocationService.GetCoordinates(Offer.Destination.LocationName)
			.then((response) => {
				const coordinates = response.data.resourceSets[0].resources[0].point.coordinates;
				newOffer.Destination.LocationName = Offer.Destination.LocationName;
				newOffer.Destination.Lattitude = coordinates[0];
				newOffer.Destination.Longitude = coordinates[1];
			});

		for (let i = 0; i < ViaPoints.length; i++) {
			await LocationService.GetCoordinates(ViaPoints[i].LocationName)
				.then((response) => {
					const coordinates = response.data.resourceSets[0].resources[0].point.coordinates;
					newOffer.ViaPoints[i] = new LocationDTO();
					newOffer.ViaPoints[i].LocationName = Offer.ViaPoints[i].LocationName;
					newOffer.ViaPoints[i].Lattitude = coordinates[0];
					newOffer.ViaPoints[i].Longitude = coordinates[1];
				});
		}
		newOffer.Discount = Offer.Discount;
		newOffer.MaxOfferSeats = Offer.MaxOfferSeats;
		newOffer.PricePerKM = Offer.PricePerKM;
		newOffer.StartTime = Offer.StartTime;
		newOffer.UserId = Offer.UserId;
		newOffer.Vehicle = Offer.Vehicle;
		if (IsOnUpdate) {
			OfferService.Update(newOffer)
				.then((respose) => {
					if (respose.data)
					{
						 history.push(GoToPath(pathname, "display"));
					}
					else return <>Sorry</>;
				});
		} else {
			debugger;
			OfferService.Create(newOffer).then((response) => {
			 history.push(GoToPath(pathname, 'display'));
			});
		}
	}
	validateBookingSubmit(): boolean {
		let validateResult: boolean = false;
		const {
			Booking: { Source, Destination, DateTime, SeatsRequired },
		} = this.state;
		if (Source.LocationName.length == 0) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });

		if (Destination.LocationName.length == 0) {
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
			const {LocationService,OfferService} = this.props;
			var SourceLocation: ILocationDTO = new LocationDTO();
			var DestinationLocation: ILocationDTO = new LocationDTO();
			await LocationService.GetCoordinates(Source.LocationName)
				.then((response) => {
					var point = response.data.resourceSets[0].resources[0].point;
					SourceLocation.Lattitude = point.coordinates[0];
					SourceLocation.Longitude = point.coordinates[1];
					SourceLocation.LocationName = Source.LocationName;

				});
				await LocationService.GetCoordinates(Destination.LocationName)
					.then((response) => {
						var point = response.data.resourceSets[0].resources[0].point;
						DestinationLocation.Lattitude = point.coordinates[0];
						DestinationLocation.Longitude = point.coordinates[1];
						DestinationLocation.LocationName = Destination.LocationName;
					});
			const data:IBookingRequestInfo = {
				Source: SourceLocation.LocationName,
				Destination: DestinationLocation.LocationName,
				SeatsRequired: SeatsRequired,
			};
			OfferService.GetByEndPonits(data).then((response) => {
				this.setState({ matchOffer: response.data });
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
        const {AutoSuggestService,LocationService,BookingService} = this.props;
		if (Toogle) {
			if(name=="Source" || name=="Destination")
			this.setState((state) => {
				return {
					Booking: { ...state.Booking, [name]:{ ...state.Booking[name],LocationName:value} },
				};
			});
			else{
				this.setState((state)=>{
					return {Booking:{...state.Booking,[name]:value}};
				})
			}
		} else {
			if (name == 'NumberPlate') {
				this.setState((state) => {
					return {
						Offer: { ...state.Offer, Vehicle: { ...state.Offer.Vehicle, [name]: value } },
					};
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

	
			const response = await AutoSuggestService.GetSuggestion(value); 
			if (name == 'Source') {
				var addresses = response.data.resourceSets[0].resources[0].value.map((e, index) => (
					<span data-index={index} data-context='Source' key={index} onClick={this.handleAddressSelect}>
						{e.address.addressLine}
					</span>
				));
				this.setState({ FromResult: <>{addresses}</> });
			} else {
				var addresses = response.data.resourceSets[0].resources[0].value.map((e, index) => (
					<span
						data-index={index}
						key={index}
						data-context='Destination'
						onClick={this.handleAddressSelect}
					>
						{e.address.addressLine}
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
					Vehicle: { ...state.Offer.Vehicle, Capacity: VehicleType[value], Type:value },
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
			Offer: {
				Vehicle: { Capacity },
			},
			SeatsMsg,
			matchOffer,
		} = this.state;
		var totalSeat = [];
		for (let i = 0; i < Capacity; i++) {
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
									disabled={bookingId!=undefined?(Booking.BookingStatus==2):false}
									value={Toogle ? Booking.Source.LocationName : Offer.Source.LocationName}
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
									value={Toogle ? Booking.Destination.LocationName : Offer.Destination.LocationName}
									onChange={this.onInputChange}
								/>
								<section className='suggestionResult'>{toResult}</section>
							</div>
							<div className='rideFormcontent'>
								<label>
									Time <span className='msg'>{dateMsg}</span>
									<div className='DateTimePicker'>
										{' '}
										<DateTimePicker
											hourPlaceholder='HH'
											minutePlaceholder='MM'
											className='dateTime'
											disabled={bookingId != undefined ? (Booking.BookingStatus == BookingStatus.ACCEPTED ? true : false) : false}
											value={Toogle ? Booking.DateTime : Offer.StartTime}
											onChange={(date) => {
												if (Toogle)
													this.setState((state) => {
														return {
															Booking: { ...state.Booking, DateTime: date },
														};
													});
												else {
													this.setState((state) => {
														return {
															Offer: { ...state.Offer, StartTime: date },
														};
													});
												}
											}}
										/>
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
											disabled={bookingId != undefined ? (Booking.BookingStatus == 2 ? true : false) : false}
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
									Next>>
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
												{shouldValidate ? (ViaPoints[0].LocationName.length == 0 ? ViaPointMsg : '') : ''}
											</span>
										</label>
										<input
											type='text'
											placeholder=' '
											autoComplete='off'
											className='extras'
											required
											name={'_0'}
											value={ViaPoints[0].LocationName || ''}
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
														{shouldValidate ? (ViaPoints[index].LocationName.length == 0 ? ViaPointMsg : '') : ''}
													</span>
												</label>
												<input
													type='text'
													placeholder=' '
													className='extras'
													autoComplete='off'
													required
													name={'_' + index}
													value={currentValue.LocationName || ''}
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
												value={Offer.Vehicle.NumberPlate || ''}
												onChange={this.onInputChange}
											/>
										</span>
										<span>
											<select name='VehicleType' onChange={this.handleSelection}>
												{Object.keys(VehicleType).map((e) => (
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
																return { Offer: { ...Offer, MaxOfferSeats: index + 1 } };
															})
														}
														checked={Offer.MaxOfferSeats == index + 1 ? true : false}
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
  AutoSuggestService:deps.AutoSuggestService,
  history: ownProps.history,
  match: ownProps.match,
  location: ownProps.location,
  isOnBooking:ownProps.isOnBooking,
  isOnUpdate:ownProps.isOnUpdate,
  LocationService:deps.LocationService
}))(Ride);