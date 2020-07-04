import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IBookingService } from '../../interface/IBookingService';
import { IUserService } from '../../interface/IUserService';
import { IOfferService } from '../../interface/IOfferService';
import { SPHttpClient } from '@microsoft/sp-http';
import { ILocationSuggestService } from '../../interface/ILocationSuggestService';
import { injectable, inject, connect } from 'react-inversify';
import {
	ConstBookingService,
	ConstUserService,
	ConstOfferService,
	ConstLocationService,
} from '../../constant/injection';
import { IBooking } from '../../interface/IBooking';
import { IUser } from '../../interface/IUser';
import { IOffering } from '../../interface/IOffering';
import { User } from '../../model/User';
import { Offering } from '../../model/Offering';
import { Booking } from '../../model/Booking';
import {
	GoToPath,
	CoonvertStringDateToObject,
	ValidateDate,
	IsElmentsInArrayDiscerte,
	ConvertToFormatForSPURL,
} from '../../utilities/utilities';
import { CityPattern, NumberPlatePattern } from './locales/constant';
import { Vehicle } from '../../model/Vehicle';
import { IVehicle } from '../../interface/IVehicle';
import { ICoordinateInfo } from '../../interface/ICoordinateInfo';
import { IDistanceService } from './../../interface/IDistanceService';
import { IBookingRequestInfo } from '../../interface/IBookingRequestInfo';
import { BookingStatus, Discount, VehicleType, Time } from '../../constant/carpool';
import Cleave from 'cleave.js/react';
import Matches from './components/Matches/Matches';
import { v4 as uuid } from 'uuid';
import * as styles from './scss/styles.module.scss';
import {
	CallToGetCoordinateBeforeRequestError,
	GeoLocationAPINotSUpportedError,
	RejectError,
} from '../../exception/CoordinateException';
import { ILocationInfo } from '../../interface/ILocationInfo';
import { CurrentLocation } from '../../module/location.module';
import { IViaPointService } from '../../interface/IViaPointService';
import { IVehicleService } from '../../interface/IVehicleService';
import { IOfferRouteAndSeatInfo } from '../../interface/IOfferRouteAndSeatInfo';
import { EBookingResponseKeys } from '../../enum/EBookingResponseKeys';
import { IOfferRequestInfo } from '../../interface/IOfferRequestInfo';

interface TParams {
	id: string;
	offerId: string;
	bookingId: string;
}
interface IRideProps extends RouteComponentProps<TParams> {
	isOnBooking: boolean;
	isOnUpdate: boolean;
	setErrorMessage: Function;
}
interface IRideDependenciesProps {
	BookingService: IBookingService;
	UserService: IUserService;
	OfferService: IOfferService;
	spHttpClient: SPHttpClient;
	LocationService: ILocationSuggestService;
	DistanceService: IDistanceService;
	ViaPointService: IViaPointService;
	VehicleService: IVehicleService;
}

@injectable()
class Dependencies {
	@inject(ConstBookingService) public readonly BookingService: IBookingService;
	@inject(ConstUserService) public readonly UserService: IUserService;
	@inject(ConstOfferService) public readonly OfferService: IOfferService;
	@inject(ConstLocationService) public readonly LocationService: ILocationSuggestService;
	@inject('DistanceService') public readonly DistanceService: IDistanceService;
	@inject('ViaPointService') public readonly ViaPointService: IViaPointService;
	@inject('VehicleService') public readonly VehicleService: IVehicleService;
}
interface IRideState {
	Toogle: boolean;
	Booking: IBooking;
	ShowRides: boolean;
	IsSlideRight: boolean;
	User: IUser;
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
	matchOffer: IOffering[];
	Vehicle: IVehicle;
	DiscreteEndPointMsg: string;
	DiscreteViaPointMsg: string;
	ViaPointKeys: Array<string>;
	DiscountMsg: string;
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
			DiscountMsg: '',
			matchOffer: null,
			Vehicle: new Vehicle(),
			DiscreteEndPointMsg: null,
			DiscreteViaPointMsg: null,
			ViaPointKeys: [uuid()],
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

	async componentDidMount() {
		const {
			match,
			isOnUpdate,
			isOnBooking,
			OfferService,
			BookingService,
			UserService,
			spHttpClient,
			setErrorMessage,
			VehicleService,
		} = this.props;
		const { params } = match;
		const { offerId, id, bookingId } = params;

		CurrentLocation.RequestCurrentCoordinates();
		if (isOnUpdate) {
			if (isOnBooking) {
				BookingService.GetById(parseInt(bookingId), spHttpClient)
					.then((response) => {
						let book: IBooking = { ...response };

						UserService.GeyUserById(book.PassengerRef, spHttpClient).then((response) => {
							const user: IUser = { ...response };
							this.setState({
								User: { ...user },
							});
						});
						this.setState({
							Booking: { ...book },
						});
					})
					.catch((error) => {
						setErrorMessage(true, error.message);
					});
			} else {
				const Offer = await OfferService.GetById(parseInt(offerId), spHttpClient);
				this.setState({
					Offer: Offer,
					ViaPointResult: Offer.ViaPoints.map((e) => <></>),
				});
				Promise.all([
					UserService.GeyUserById(Offer.UserId, spHttpClient),
					VehicleService.GetById(Offer.VehicleId, spHttpClient),
				])
					.then((response) => {
						this.setState({ User: { ...response[0] }, Vehicle: { ...response[1] } });
					})
					.catch((error) => {
						setErrorMessage(true, error.message);
					});
			}
		} else {
			UserService.GeyUserById(parseInt(id), spHttpClient)
				.then((response) => {
					const user: IUser = { ...response };
					this.setState({
						User: { ...user },
					});
				})
				.catch((error) => {
					setErrorMessage(true, (error as Error).message);
				});
			
			if (isOnBooking)
				this.setState({ Booking: { ...new Booking(), PassengerRef: parseInt(id) } });
			else
				this.setState({ Offer: new Offering() });
		}
	}

	handleSlider(event) {
		const { Toogle } = this.state;
		const {
			history,
			location,
			match: {
				params: { id },
			},
		} = this.props;
		const { pathname } = location;
		if (Toogle) {
			this.setState({
				Toogle: false,
				IsSlideRight: false,
				ShowOfferForm: true,
				ShowRides: false,
			});
			history.push(GoToPath.RideOffer(parseInt(id)));
		} else {
			this.setState({
				Toogle: true,
				IsSlideRight: true,
				ShowOfferForm: false,
				ShowRides: false,
			});
			history.push(GoToPath.RideBook(parseInt(id)));
		}
	}

	handleAddressSelect(event) {
		debugger;
		const { target } = event;
		const { dataset, textContent } = target;
		const { stopindex, context, index, location } = dataset;
		const { isOnBooking } = this.props;
		const coords: ICoordinateInfo = JSON.parse(location);
		if (context == 'viapoint') {
			this.setState((state) => {
				return {
					ViaPointResult: state.Offer.ViaPoints.map((e) => <></>),
					Offer: {
						...state.Offer,
						ViaPoints: [
							...state.Offer.ViaPoints.map((currValue, index) => {
								if (index == stopindex)
									return { ...state.Offer.ViaPoints[stopindex], Place: textContent, Coords: { ...coords } };
								else return currValue;
							}),
						],
					},
				};
			});
		} else if (context == 'Source') {
			if (isOnBooking) {
				this.setState((state) => {
					return {
						FromResult: <></>,
						Booking: { ...state.Booking, Source: textContent, SourceCoords: { ...coords } },
					};
				});
			} else {
				this.setState((state) => {
					return {
						FromResult: <></>,
						Offer: { ...state.Offer, Source: textContent, SourceCoords: { ...coords } },
					};
				});
			}
		} else {
			if (isOnBooking)
				this.setState((state) => {
					return {
						ToResult: <></>,
						Booking: { ...state.Booking, Destination: textContent, DestinationCoords: { ...coords } },
					};
				});
			else
				this.setState((state) => {
					return {
						ToResult: <></>,
						Offer: {
							...state.Offer,
							Destination: textContent,
							DestinationCoords: { ...coords },
						},
					};
				});
		}
	}

	async onViaPointInput(event) {
		debugger;
		let { name, value } = event.target;
		const { LocationService } = this.props;
		name = name.substring(1);
		const indexValue: number = Number(name);
		this.setState((state) => {
			return {
				Offer: {
					...state.Offer,
					ViaPoints: [
						...state.Offer.ViaPoints.filter((e, index) => {
							if (index < indexValue) {
								if (!e.Place) return ' ';
								else return e;
							}
						}),
						{ ...state.Offer.ViaPoints[indexValue], Place: value },
						...state.Offer.ViaPoints.filter((currValue, index) => {
							if (index > indexValue) {
								if (!currValue.Place) return ' ';
								else return currValue;
							}
						}),
					],
				},
			};
		});
		if (value) {
			LocationService.GetSuggestion(value).then((response) => {
				this.setState((state) => {
					return {
						ViaPointResult: [
							...state.ViaPointResult.filter((e, index) => {
								if (index < indexValue) return <></>;
							}),
							<>
								{response.map((e, index) => (
									<span
										data-stopindex={indexValue}
										data-context='viapoint'
										data-location={JSON.stringify(e.Coordinates)}
										className='address'
										onClick={this.handleAddressSelect}
									>
										{e.Name}
									</span>
								))}
							</>,
							...state.ViaPointResult.filter((e, index) => {
								if (index > indexValue) return <></>;
							}),
						],
					};
				});
			});
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
				Offer: {
					...state.Offer,
					ViaPoints: [
						...state.Offer.ViaPoints,
						{ DistanceFromLastPlace: 0, Id: 0, Place: '', Coords: { Lattitude: '', Longitude: '' } },
					],
				},
				ViaPointKeys: [...state.ViaPointKeys, uuid()],
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
				ViaPointKeys: [...state.ViaPointKeys].filter((item, itemIndex) => {
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
			Vehicle,
		} = this.state;
		//Source Validate
		if (!Offer.Source) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });
		//Destination Validate
		if (!Offer.Destination) {
			validateResult = true;
			this.setState({ ToMsg: 'Please Enter Destination' });
		} else this.setState({ ToMsg: '' });

		let IsAllViaPointNotEmpty: boolean = true;
		for (let i = 0; i < ViaPoints.length; i++) {
			if (!ViaPoints[i].Place) {
				IsAllViaPointNotEmpty = false;
				this.setState({ ShouldValidate: true });
				validateResult = true;
			}
		}
		if (IsAllViaPointNotEmpty)
			if (!IsElmentsInArrayDiscerte([...ViaPoints.map((e) => e.Place)]))
				this.setState({ DiscreteViaPointMsg: 'Please Enter Discrete Viapoints Stopage . . .' });
			else this.setState({ DiscreteViaPointMsg: '' });

		if (Offer.Source && Offer.Destination && Offer.Source == Offer.Destination)
			this.setState({ DiscreteEndPointMsg: 'Please Enter Different EndPoints' });
		else this.setState({ DiscreteEndPointMsg: '' });
		if (!Number.isInteger(Offer.Discount)) {
			this.setState({ DiscountMsg: 'Please Select Discount Options' });
		} else this.setState({ DiscountMsg: '' });
		if (!Offer.Time) {
			validateResult = true;
			this.setState({ TimeMsg: 'Please Select A Time . . .' });
		} else {
			this.setState({ TimeMsg: '' });
		}
		if (!Offer.StartTime) {
			validateResult = true;
			this.setState({ DateMsg: 'Please Enter Date . . .' });
		} else {
			if (ValidateDate(CoonvertStringDateToObject(Offer.StartTime))) this.setState({ DateMsg: '' });
			else this.setState({ DateMsg: 'Please Enter Date Within 30 Days' });
		}

		if (!Offer.SeatsOffered) {
			validateResult = true;
			this.setState({ SeatsMsg: 'Select Seats' });
		} else this.setState({ SeatsMsg: '' });

		if (!Offer.PricePerKM) {
			validateResult = true;
			this.setState({ PriceMsg: 'Enter Price' });
		} else this.setState({ PriceMsg: '' });

		if (!Vehicle.NumberPlate && !NumberPlatePattern.test(Vehicle.NumberPlate)) {
			validateResult = true;
			this.setState({ VehicleInfoMsg: 'Enter Registration Number' });
		} else {
			this.setState({ VehicleInfoMsg: '' });
		}
		return validateResult;
	}
	async onOfferSubmit(event) {
		event.preventDefault();

		const {
			Offer: Offer,
			Offer: { ViaPoints, SourceCoords, DestinationCoords },
			IsOnUpdate: IsOnUpdate,
			Vehicle,
			User,
		} = this.state;
		const {
			OfferService,
			history,
			DistanceService,
			spHttpClient,
			VehicleService,
			match: {
				params: { id },
			},
			setErrorMessage,
			ViaPointService,
		} = this.props;

		if (this.offerSubmitValidate()) return;
		let oldOffer: IOffering = null;
		let shouldCalculateDistance: boolean = true;
		try {
			if (IsOnUpdate) {
				const response = await OfferService.GetById(Offer.Id, spHttpClient);
				oldOffer = { ...response };

				if (
					JSON.stringify(oldOffer.ViaPoints.map((e) => e.Place)) ==
					JSON.stringify(Offer.ViaPoints.map((e) => e.Place))
				)
					shouldCalculateDistance = false;
			}
			if (shouldCalculateDistance) {
				const ViaPointsCoords: ICoordinateInfo[] = Offer.ViaPoints.map((e) => e.Coords);
				for (var i = 0; i < ViaPointsCoords.length; i++) {
					if (i == 0) {
						await DistanceService.GetDistance(SourceCoords, ViaPointsCoords[i]).then((response) => {
							Offer.ViaPoints[0].DistanceFromLastPlace = response.Distance;
						});
					} else {
						await DistanceService.GetDistance(ViaPointsCoords[i - 1], ViaPointsCoords[i]).then(
							(response) => {
								Offer.ViaPoints[i].DistanceFromLastPlace = response.Distance;
							},
						);
					}
				}
				await DistanceService.GetDistance(
					ViaPointsCoords[ViaPointsCoords.length - 1],
					DestinationCoords,
				).then((response) => {
					Offer.DistanceFromLastPlace = response.Distance;
				});
			}
		} catch (e) {
			setErrorMessage(true, (e as Error).message);
		}

		if (IsOnUpdate) {
			try {
				if (shouldCalculateDistance) {
					const deleteReponse = await ViaPointService.BatchDelete(
						[...oldOffer.ViaPoints.map((e) => e.Id)],
						spHttpClient,
					);
					deleteReponse.map((e) => {
						if (!e) {
							alert('An Unexpected Error Occured.Cannot Delete All ViaPoints');
							throw new Error('Unexpected Error.Cannot Delete All ViaPoints.Please Try Again.');
						}
					});
					const response = await ViaPointService.BatchAdd(Offer.ViaPoints, spHttpClient);
					
					Offer.ViaPoints = [...response];

					Offer.ViaPoints.map((e) => {
						if (!e.Id) {
							alert('An Unexpected Error Occured.Cannot Add All ViaPoints');
							throw new Error('Unexpected Error.Cannot Add All ViaPoints.Please Try Again.');
						}
					});
				}
				const oldVehicle = await VehicleService.GetById(Offer.VehicleId, spHttpClient);
				if (oldVehicle.NumberPlate != Vehicle.NumberPlate || oldVehicle.Type != Vehicle.Type) {
					const newVehicle = await VehicleService.Update(Vehicle, spHttpClient);
				}
				OfferService.Update(Offer, spHttpClient).then((respose) => {
					history.push(GoToPath.Display(parseInt(id)));
				});
			} catch (error) {
				setErrorMessage(true, (error as Error).message);
			}
		} else {
			try {
				const response = await ViaPointService.BatchAdd(Offer.ViaPoints, spHttpClient);
				Offer.ViaPoints = [...response];
				Offer.ViaPoints.map((e) => {
					if (!e.Id) {
						alert('An Unexpected Error Occured.Cannot Add All ViaPoints');
						throw new Error('Unexpected Error.Cannot Add All ViaPoints.Please Try Again.');
					}
				});

				const vehicleResponse = await VehicleService.Create(Vehicle, spHttpClient);
				Offer.VehicleId = vehicleResponse.Id;
				Offer.Active = true;
				Offer.UserId = User.Id;
				OfferService.Create(Offer, spHttpClient).then((response) => {
					history.push(GoToPath.Dashboard(parseInt(id)));
				});
			} catch (e) {
				setErrorMessage(true, (e as Error).message);
			}
		}
	}
	validateBookingSubmit(): boolean {
		let validateResult: boolean = false;
		const {
			Booking: { Source, Destination, DateOfBooking: DateTime, SeatsRequired, Time },
		} = this.state;
		if (!Source) {
			validateResult = true;
			this.setState({ FormMsg: 'Please Enter Source' });
		} else this.setState({ FormMsg: '' });

		if (!Destination) {
			validateResult = true;
			this.setState({ ToMsg: 'Please Enter Destination' });
		} else this.setState({ ToMsg: '' });

		if (!Source && !Destination && Source == Destination)
			this.setState({ DiscreteEndPointMsg: 'Please Enter Different EndPoints' });
		else this.setState({ DiscreteEndPointMsg: '' });

		if (DateTime && !ValidateDate(CoonvertStringDateToObject(DateTime))) {
			validateResult = true;
			this.setState({ DateMsg: 'Please Enter Valid Date' });
		} else this.setState({ DateMsg: '' });

		if (!SeatsRequired) {
			validateResult = true;
			this.setState({ SeatsMsg: 'Enter Number Of Seats Required' });
		} else this.setState({ SeatsMsg: '' });

		if (!Time) {
			validateResult = true;
			this.setState({ TimeMsg: 'Please Enter Valid Time . . .' });
		} else {
			this.setState({ TimeMsg: '' });
		}
		return validateResult;
	}

	async onBookingSubmit(event) {
		event.preventDefault();
		if (this.validateBookingSubmit()) return;
		const {
			Booking: { Source, Destination, SeatsRequired,DateOfBooking,Time },
		} = this.state;
	
		const { OfferService, spHttpClient, setErrorMessage,DistanceService ,BookingService} = this.props;
		const OfferRequestInfo:IOfferRequestInfo= {
			Date: ConvertToFormatForSPURL(DateOfBooking),
			SeatsRequired: SeatsRequired,
			Time:Time
		};
		const routes: IOfferRouteAndSeatInfo[] = await OfferService.GetRouteAndSeatsOfferedOfAllActiveOffer(OfferRequestInfo, spHttpClient); 
		OfferService.setBookingService(BookingService);
	
		OfferService.GetByEndPonits(routes,Source,Destination,SeatsRequired, spHttpClient)
			.then((response) => {
				OfferService.setBookingService(null);
				if (response.length) {
					let offerRequest = [];
					for (let i = 0; i < response.length; i++) 
						offerRequest.push(OfferService.GetById(response[i], spHttpClient));
					Promise.all([...offerRequest]).then(responses => {
						this.setState({ matchOffer: [...responses] });
					}).catch(e => {
						setErrorMessage(true,(e as Error).message);
					});
				}
				else
					this.setState({ matchOffer: [] });
		   })
			.catch((error) => {
		        OfferService.setBookingService(null);
				setErrorMessage(true, error.message);
			});
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
		const { LocationService, history, setErrorMessage } = this.props;
		if (Toogle) {
				this.setState((state) => {
					return { Booking: { ...state.Booking, [name]: value } };
				});
		} else {
			if (name == 'NumberPlate') {
				this.setState((state) => {
					return { Vehicle: { ...state.Vehicle, NumberPlate: value } };
				});
			} else
				this.setState((state) => {
					return {
						Offer: { ...state.Offer, [name]: value },
					};
				});
		}
		if (name == 'Source' || name == 'Destination') {
			if (!value && name == 'Destination') {
				this.setState({ ToResult: <></> });
				return;
			}
			if (!value && name == 'Source') {
				this.setState({ FromResult: <></> });
				return;
			}
			let suggestAddress: ILocationInfo[] = null;
			try {
				suggestAddress = await LocationService.GetSuggestion(value);
			} catch (error) {
				if (error instanceof CallToGetCoordinateBeforeRequestError) history.push('/error');
				else if (error instanceof GeoLocationAPINotSUpportedError) {
					alert('GeoLocation Not Supported . . .\nMoving Back');
					history.goBack();
				} else if (error instanceof RejectError)
				{
					alert('App Will Not Able to Suggest Places.Please ComeBack and Accept');
				}
				else {
					setErrorMessage(true, error.message);
				}
				return;
			}
			if (name == 'Source') {
				var addresses = suggestAddress.map((e, index) => (
					<span
						data-index={index}
						key={uuid()}
						data-context='Source'
						data-location={JSON.stringify(e.Coordinates)}
						onClick={this.handleAddressSelect}
					>
						{e.Name}
					</span>
				));
				this.setState({ FromResult: <>{addresses}</> });
			} else {
				var addresses = suggestAddress.map((e, index) => (
					<span
						data-index={index}
						key={uuid()}
						data-context='Destination'
						data-location={JSON.stringify(e.Coordinates)}
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
				Vehicle: {
					...state.Vehicle,
					Capacity: parseInt(value),
					Type: Object.keys(VehicleType).find((key) => VehicleType[key] == value),
				},
			};
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
			DiscountMsg,
			DiscreteEndPointMsg,
			matchOffer,
			DiscreteViaPointMsg,
		} = this.state;

		const {
			match: {
				params: { bookingId },
			},
		isOnBooking} = this.props;
		let totalSeats = [];
		for (let i = 0; i < Vehicle.Capacity - 1; i++) totalSeats.push(i + 1);
		const currDate: Date = new Date();
		return (
			<div className={styles.default.ride}>
				<form
					className={
						styles.default.rideForm +
						' '.concat(Toogle ? styles.default.formWidthLess : styles.default.formWidthMore)
					}
				>
					<div className={styles.default.rideContent}>
						<div className={styles.default.rideHead}>
							<div className={styles.default.top}>
								<h1>{Toogle ? 'Book a Ride' : 'Offer a Ride'}</h1>
								<input
									type='checkbox'
									checked={isSlideRight}
									onChange={this.handleSlider}
									disabled={bookingId != undefined}
								/>
							</div>
							<p>we get you the matches asap!</p>
						</div>
						<label className={styles.default.main_error_msg}>{DiscreteEndPointMsg}</label>
						<div className={styles.default.rideFormBar}>
							<div
								className={styles.default.rideFormcontent.concat(' ' + styles.default.positionRelative)}
							>
								<label>
									From <span className={styles.default.msg}>{FormMsg}</span>
								</label>
								<input
									type='text'
									name='Source'
									autoComplete='off'
									placeholder=' '
									id='from'
									disabled={bookingId != undefined ? Booking.Status == BookingStatus.ACCEPTED : false}
									value={Toogle ? Booking.Source || '' : Offer.Source || ''}
									onChange={this.onInputChange}
								/>
								<section className={styles.default.suggestionResult}>{fromResult}</section>
							</div>
							<div
								className={styles.default.rideFormcontent.concat(' ' + styles.default.positionRelative)}
							>
								<label>
									To <span className={styles.default.msg}>{ToMsg}</span>
								</label>
								<input
									type='text'
									name='Destination'
									id='to'
									placeholder=' '
									autoComplete='off'
									value={Toogle ? Booking.Destination || '' : Offer.Destination || ''}
									onChange={this.onInputChange}
								/>
								<section className={styles.default.suggestionResult}>{toResult}</section>
							</div>
							<div className={styles.default.rideFormcontent}>
								<label>
									Date <span className={styles.default.msg}>{dateMsg}</span>
									<div>
										<Cleave
											placeholder='DD/MM/YYYY'
											options={{
												date: true,
												datePattern: ['d', 'm', 'Y'],
												delimiter: '/',
												dateMin: new Date().toISOString(),
											}}
											onChange={this.onInputChange}
											className='form-field'
											name={Toogle ? 'DateOfBooking' : 'StartTime'}
											value={Toogle?Booking.DateOfBooking||'':Offer.StartTime||''}
										/>
									</div>
								</label>
							</div>
							<div className={styles.default.timePicker}>
								<label>
									Time <span className={styles.default.msg}>{TimeMsg}</span>
									<div className={styles.default.timeContainer}>
										{Time.map((e) => {
											return (
												<div className={styles.default.timeHolder} key={uuid()}>
													<input
														type='radio'
														name='Time'
														checked={Toogle ? Booking.Time == e : Offer.Time == e}
														value={e}
														onClick={this.onInputChange}
													/>
													<label>{e}</label>
												</div>
											);
										})}
									</div>
								</label>
							</div>

							{Toogle ? (
								<>
									<div className={styles.default.rideFormcontent}>
										<label>
											Seats Required : <span className={styles.default.msg}>{SeatsMsg}</span>
										</label>
										<input
											type='text'
											name="SeatsRequired"
											disabled={bookingId && Booking.Status == BookingStatus.ACCEPTED}
											placeholder=' '
											value={Booking.SeatsRequired||''}
											onChange={this.onInputChange}
										/>
									</div>

									<button
										type='button'
										className={styles.default['submit-button']}
										onClick={this.onBookingSubmit}
									>
										Submit
									</button>
								</>
							) : (
								<div className={styles.default.rideFormcontent}>
									<label>
										Discount : <span className={styles.default.msg}>{DiscountMsg}</span>
									</label>
									<select
										className={styles.default.discount}
										name='Discount'
										value={Offer.Discount + ''}
										onChange={(event) => {
											const { value } = event.currentTarget;
											this.setState((state) => {
												return { Offer: { ...state.Offer, Discount: parseInt(value) } };
											});
										}}
									>
										{Object.entries(Discount).map((e) => (
											<option value={e[1]}>{e[0]}</option>
										))}
									</select>
								</div>
							)}
						</div>
						{Toogle ? (
							''
						) : (
							<button className={styles.default.next} onClick={this.displayOfferRightPanel}>
								Next &gt;&gt;
							</button>
						)}
					</div>

					{showOfferForm ? (
						<>
							<div className={styles.default.rideFormContinue}>
								<div className={styles.default.rideHead}>
									<div className={styles.default.top}>
										<h1>{'Offer a Ride'}</h1>
										<input type='checkbox' checked={Toogle} onChange={this.handleSlider} />
									</div>
									<p>we get you the matches asap!</p>
									<p className={styles.default.main_error_msg}>{DiscreteViaPointMsg}</p>
								</div>
								<div className={styles.default.viapoints}>
									<div className={styles.default.stops}>
										<label>
											Stop 1&nbsp;
											<span className={styles.default.msg}>
												{shouldValidate ? (!ViaPoints[0].Place ? ViaPointMsg : '') : ''}
											</span>
										</label>
										<input
											type='text'
											autoComplete='off'
											className='extras'
											name={'_0'}
											value={ViaPoints[0].Place || ''}
											onChange={this.onViaPointInput}
										/>
										<section className={styles.default.suggestionResult}>{ViaPointResult[0]}</section>
									</div>
									{ViaPoints.map((currentValue, index) => {
										if (index == 0) return '';
										return (
											<div className={styles.default.stops} key={this.state.ViaPointKeys[index]}>
												<label className={styles.default.minus} onClick={this.removeStop}>
													<i className='fa fa-times' data-key={index + ''}></i>
												</label>
												<label>
													Stop {index + 1}{' '}
													<span className={styles.default.msg}>
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
												<section className={styles.default.suggestionResult}>{ViaPointResult[index]}</section>
											</div>
										);
									})}
								</div>
								<label className={styles.default.plus} onClick={this.AddMoreStops}>
									<i className='fa fa-plus'></i>
								</label>
								<div className={styles.default.rideFormcontent.concat(' ' + styles.default.VehicleInfo)}>
									<label>
										Vehicle Information <span className={styles.default.msg}>{VehicleInfoMsg}</span>
									</label>
									<p>
										<span>
											<Cleave
												placeholder='Number Plate'
												name='NumberPlate'
												value={Vehicle.NumberPlate || ''}
												options={{
													blocks: [2, 2, 4],
													delimiter: ' ',
													uppercase: true,
												}}
												onChange={this.onInputChange.bind(this)}
											/>
										</span>
										<span>
											<select
												name='VehicleType'
												className={styles.default.vehicleType}
												value={Vehicle.Capacity}
												onChange={this.handleSelection}
											>
												{Object.entries(VehicleType).map((e) => (
													<option value={e[1]} key={uuid()}>
														{e[0]}
													</option>
												))}
											</select>
										</span>
									</p>
								</div>
								<div className={styles.default.seats}>
									<label>
										Available Seats <br />
										<span className={styles.default.msg}>{SeatsMsg}</span>{' '}
									</label>
									<div className={styles.default.seatContainer}>
										{totalSeats.map((e, index) => (
											<div key={uuid()} className={styles.default.seatHolder}>
												<input
													type='radio'
													key={uuid()}
													value={e}
													name='seats'
													onChange={() =>
														this.setState((state) => {
															return { Offer: { ...Offer, SeatsOffered: e } };
														})
													}
													checked={Offer.SeatsOffered == index + 1}
												/>
												<label>{index + 1}</label>
											</div>
										))}
									</div>
								</div>
								<div className={styles.default.rideFormcontent.concat(' ' + styles.default.offerPrice)}>
									<label>
										Price <span className={styles.default.msg}>{PriceMsg}</span>
									</label>
									<Cleave
										options={{
											numeralPositiveOnly: true,
											numeral: true,
											stripLeadingZeroes: true,
											noImmediatePrefix: true,
										}}
										onChange={this.onInputChange.bind(this)}
										placeholder='Enter Ride Price'
										name='PricePerKM'
										value={Offer.PricePerKM}
									/>
								</div>
								<br />
								<br />
								<br />
								<br />
								<br />
								<button
									type='submit'
									form='rideForm'
									className={styles.default['submit-button']}
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

				{<Matches {...this.props} Offers={matchOffer} Book={!isOnBooking?null:(matchOffer?Booking:null)} />}
			</div>
		);
	}
}

export default connect(Dependencies, (deps, ownProps: IRideProps) => ({
	UserService: deps.UserService,
	OfferService: deps.OfferService,
	DistanceService: deps.DistanceService,
	BookingService: deps.BookingService,
	isOnBooking: ownProps.isOnBooking,
	isOnUpdate: ownProps.isOnUpdate,
	LocationService: deps.LocationService,
	ViaPointService: deps.ViaPointService,
	VehicleService: deps.VehicleService,
	match: ownProps.match,
	location: ownProps.location,
	history: ownProps.history,
	setErrorMessage: ownProps.setErrorMessage,
}))(Ride);
