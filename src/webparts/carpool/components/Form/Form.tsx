import * as React from "react";
import { User } from "../../model/User";
import SwitchForm from "./components/SwitchForm/SwitchForm";
import { GoToPath } from "../../utilities/utilities";
import { PasswordPattern, EmailPattern } from './locales/regexp';
import { connect, injectable, inject } from "react-inversify";
import { ConstUserService } from "../../constant/injection";
import * as styles from './scss/styles.module.scss';
import { IUserService } from "../../interface/IUserService";
import { IUser } from "../../interface/IUser";
import { SPHttpClient } from '@microsoft/sp-http';
import {  RouteComponentProps } from 'react-router-dom';
import Logo from './../Logo/Logo';
import * as AppSetting from 'AppSettings';
interface TParams  {
  id: string;
}
interface IFormProps extends RouteComponentProps<TParams> {
  IsLogIn: boolean;
  spHttpClient: SPHttpClient;
  setErrorMessage: Function;
}

interface IFormDependenciesProps {
  UserService: IUserService;
}

@injectable()
class Dependencies {
  @inject(ConstUserService) public readonly UserService: IUserService;
}

interface IFormState {
  IsLogIn?: boolean;
  User?: IUser;
  showPassword: boolean;
  IsImageSelected: boolean;
  ImageUploaded:any;
  ImageName: string;
  msg: string;
  isOnUpdate: boolean;
  src: string;
  confirmPassword: string;
  emailMsg: string;
  nameMsg: string;
  passwordMsg: string;
  imageMsg: string;

}
class Form extends React.Component<
  IFormProps & IFormDependenciesProps,
  IFormState
> {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.state = {
      User: {
        Active: true,
        EMail: '',
        FullName: '',
        Id: 0,
        Password: '',
        ProfileImageUrl:'',FileName:''
      },
      ImageUploaded: null,
      showPassword: false,
      IsLogIn: this.props.IsLogIn,
      src:' ',
      msg: "",
      isOnUpdate: true,
      confirmPassword: "",
      emailMsg: "",
      nameMsg: "",
      passwordMsg: "",
      imageMsg: "",
      ImageName: '',
      IsImageSelected: false
    };

    this.OnSumitClick = this.OnSumitClick.bind(this);
    this.HandleChange = this.HandleChange.bind(this);
    this.OnFileUpload = this.OnFileUpload.bind(this);
    this.TogglePassword = this.TogglePassword.bind(this);
    this.OnSubmitValidate = this.OnSubmitValidate.bind(this);
    this.HandleDelete = this.HandleDelete.bind(this);
    this.HandleCancel = this.HandleCancel.bind(this);
  }
  HandleDelete(event) {
    event.preventDefault();
    const { UserService, history,spHttpClient } = this.props;
    const { Id } = this.state.User;
    
    UserService.Delete(Id, spHttpClient).then(response => {
      if (response) history.push("/");
      else {
        this.setState({ msg: "Please Try Again To Delete Account" });
      }
    }).catch((error:Error) => {
      this.setState({ msg: error.message });
    })
  }
  componentWillReceiveProps(props:IFormProps) {
    if (this.props.IsLogIn != props.IsLogIn)
      this.setState({ IsLogIn: props.IsLogIn });
  }
  componentDidMount() {
    const { match, UserService,spHttpClient,setErrorMessage } = this.props;
    const {params} = match;
    const { id } = params;
    
    if (id != undefined) {
      UserService.GeyUserById(parseInt(id),spHttpClient)
        .then(respone => {
          this.setState({
            User: { ...respone },
            src:AppSetting.tenantURL+respone.ProfileImageUrl,
            IsImageSelected: true,
            ImageUploaded:null
          });
        }).catch(e => {
          setErrorMessage(true, "Error Loading User");
        });
    } else {
      const user: IUser = new User();
      this.setState({
        isOnUpdate: false,
        User: { ...user },
        src: '',
        IsImageSelected: false
      });
    }
  }
  TogglePassword() {
    this.setState(state => ({ showPassword: !state.showPassword }));
  }

  OnFileUpload = (event:React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { files } = event.currentTarget;
    const file = files[0];
    
    if (file) {
      const reader:FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const { result } =reader;
        this.setState({
          src: result+'',
          ImageName: file.name,
          IsImageSelected: true,
          ImageUploaded:file
        });
      };
    }
  }
  
  HandleChange(event) {
    const { name, value } = event.target;

    if (
      name == "Name" ||
      name == "EMail" 
    ) {
      this.setState(state => {
        return { User: { ...state.User, [name]: value } };
      });
    } else  if(name=="Password"){
      const password: string = value;
      if (!password.length) {
        this.setState((state) => { return { User: {...state.User,Password:''} }});
        return;
      }
      const { User: { Password } } = this.state;
      if(password.length<Password.length)
      this.setState(state => {
        return { User: { ...state.User, Password: state.User.Password.substr(0,password.length) } };
      });
      else
      this.setState(state => {
        return { User: { ...state.User, Password: state.User.Password+password.charAt(password.length-1) } };
      });
    }
    else if (name == "confirmPassword") {
      const password: string = value;
      if (!password.length) {
        this.setState({ confirmPassword: '' });
        return;
      }
        const { confirmPassword } = this.state;
      if(password.length<confirmPassword.length)
      this.setState(state => {
        return { confirmPassword: state.confirmPassword.substr(0,password.length)  };
      });
      else
      this.setState(state => {
        return { confirmPassword:state.confirmPassword+password.charAt(password.length-1) };
      });
    }
  }
  HandleCancel() {
    const { history, location, match} = this.props;
    const { } = match;
    const {pathname} = location;
    const { id } = this.props.match.params;
    history.push(GoToPath.Dashboard(parseInt(id)));
  }
  OnSubmitValidate() {
    let validateResult: boolean = true;
    const {IsImageSelected, confirmPassword, IsLogIn,ImageUploaded,isOnUpdate } = this.state;
    const {
      Password: password,
      FullName: name,
      EMail: emailId,
     } = this.state.User;
    if (!IsLogIn)
    {
      if (isOnUpdate?(confirmPassword.length?password != confirmPassword:false):password != confirmPassword ) {
        this.setState({
          msg: "Your Password Do Not Match With Confirm Password",
        });
        validateResult = false;
      } else this.setState({ msg: "" });
    
    }
    
    if (emailId.length == 0 || !EmailPattern.test(emailId)) {
      this.setState({ emailMsg: "Please Enter Valid EmailId" });
      validateResult = false;
    } else this.setState({ emailMsg: "" });
   
    if (password.length == 0 || !PasswordPattern.test(password)) {
      validateResult = false;
      this.setState({ passwordMsg: "Please Enter Valid Password" });
    } else this.setState({ passwordMsg: "" });
    if (IsLogIn)
      return validateResult;
    if (IsImageSelected || ImageUploaded) 
      this.setState({ imageMsg: "" });
    else 
   {
    this.setState({ imageMsg: "Please, Upload an image" });
    validateResult = false;
   }
    return validateResult;
  }

  async OnSumitClick(event) {
    event.preventDefault();
    const { IsLogIn, UserService, spHttpClient, history, setErrorMessage } = this.props;
    if (!this.OnSubmitValidate()) return;
    if (IsLogIn) {
      const { EMail: emailId, Password: password } = this.state.User;
      UserService.LogIn(emailId, password,spHttpClient).then(res => {
        debugger;
        if (res) 
          history.push(GoToPath.Dashboard(res.Id));
         else {
          this.setState({
            msg: "Please, Enter valid Credentials ",
          });
        }
      }).catch((error: Error) => {
        setErrorMessage(true, 'Cannot LogIn\n' + error.message);
      });
    } else {
  
      const { isOnUpdate } = this.state;
      const { history,spHttpClient,setErrorMessage } = this.props;
      const { User } = this.state;

      let tempUser: IUser ={...User};
      tempUser = { ...User };

      if (isOnUpdate) {
        try {
          const { ImageUploaded,ImageName } = this.state;
          
          if (ImageUploaded) {
            if (tempUser.FileName) {
              await UserService.UpdateProfileImage(tempUser.Id, tempUser.FileName, ImageUploaded, spHttpClient).catch(e => {
                setErrorMessage(true, 'Unexpected Error.Image Not Updated');
              });
            } else {
              await UserService.UploadProfileImage(tempUser.Id, ImageName, ImageUploaded, spHttpClient).catch(e => {
                setErrorMessage(true, 'Unexpected Error.Image Not uploaded');
              }); 
            }
          }
            await UserService.Update(tempUser, spHttpClient);
            history.push(GoToPath.Dashboard(tempUser.Id));
        }
        catch (e) {
          setErrorMessage(true,(e as Error).message);
        }
        
        } else {
        try {
          const IsAlreadyExists = await UserService.IsAlreadyExists(tempUser.EMail, spHttpClient);
          if (IsAlreadyExists) {
            this.setState({ msg: 'EMail Already Exists.Please Enter Unique EmailId' });
            return;
          }
          const CurrentUserId = await UserService.GetCurrentUserLogInId(spHttpClient);
          await UserService.Create(tempUser, CurrentUserId, spHttpClient).then(res => {
            tempUser = { ...res };
          });
          const {ImageName,ImageUploaded} = this.state;
        
          await UserService.UploadProfileImage(tempUser.Id, ImageName, ImageUploaded, spHttpClient).catch(e => {
            setErrorMessage(true, 'Unexpected Error.Image Not uploaded');
          });   
      
          history.push(GoToPath.Dashboard(tempUser.Id));
      
        } catch (e) {
          setErrorMessage(true,(e as Error).message);
        }
      }
    }
  }

  render() {
    const {
      src,
      emailMsg,
      imageMsg,
      passwordMsg,
      IsLogIn,
      msg,
      User,
      isOnUpdate,
      showPassword,
      confirmPassword
    } = this.state;

    return (
      <div className={styles.default.container}>
        <div className={styles.default.image}><Logo/></div>
        <div className={`${styles.default.formBar} `.concat(IsLogIn ? styles.default.signUp : styles.default.logIn)}>
          <form className={styles.default.formSection} onSubmit={this.OnSumitClick}>
            <label className={styles.default.heading}>
              {isOnUpdate ? "Edit Profile" : IsLogIn ? "Log In" : "Sign Up"}
            </label>
            <label className={styles.default.error_msg+" ".concat(styles.default.error_center)}>{msg}</label>
            <div className={styles.default.msg_input_container}>
              <label className={styles.default.error_msg}>*&nbsp;{emailMsg}</label>
              <div className={styles.default["input-container"]}><input
                type='text'
                name='EMail'
                className='inputText'
                autoComplete={"off"}
                required
                placeholder=" "
                value={User.EMail}
                onChange={this.HandleChange}
              />
              <span>Enter Your Mail-Id</span>
              </div>
            </div>

            <div className={styles.default.msg_password_input_container}>
              <label className={styles.default.error_msg}>*&nbsp;{passwordMsg}</label>
              <div className={styles.default.passwordHolder}>
                <div className={styles.default["input-container"]}><input
                type="text"
                name='Password'
                placeholder=" "
                autoComplete='off'
                className='inputText'
                value={showPassword?User.Password:User.Password.replace(/./g,'*') || ""}
                onChange={this.HandleChange}
              /><span className='floating-label'>Your Password</span>
                </div><label className={styles.default.togglePassword} onClick={this.TogglePassword}>
              {!showPassword ? (
                <i className='fa fa-eye'></i>
              ) : (
                <i className='fa fa-eye-slash'></i>
              )}
            </label></div>
                
               
            </div>
            {IsLogIn ? (
              " "
            ) : (
              <>
                  {" "}
                  <div className={styles.default.msg_input_container}>
                  <label className={styles.default.error_msg}>* &nbsp;</label>
                  <div className={styles.default["input-container"]} >
                  <input
                    type='text'
                    name='confirmPassword'
                        autoComplete='off'
                        placeholder=" "
                    value={confirmPassword.replace(/./g,'*') || ""}
                    className='inputText'
                    required
                    onChange={this.HandleChange}
                  />
                  <span className='floating-label'>Confirm Password</span>
                    </div>
                  </div>
                <div className={styles.default.uploadSection}>
                  <input
                    type='file'
                    onChange={this.OnFileUpload}
                    id='fileChoose' />

                  <label htmlFor='fileChoose' className='uploadButton'>
                    Upload
                  </label>
                  <div className={styles.default.imageBorder}><img src={src} className='image' /></div>
                </div>
                <label className={styles.default.error_msg+" ".concat(styles.default.error_center)}>{imageMsg}</label>
              </>
            )}
            {isOnUpdate ? (
              <div className={styles.default.updateSection}>
                {" "}
                <button className='delete-button' onClick={this.HandleDelete}>
                  Delete
                </button>
                <label className='cancel-label' onClick={this.HandleCancel}>
                  <i className='fa fa-ban'></i>
                </label>
              </div>
            ) : (
              <></>
            )}
            <div className={styles.default.submitSection}>
              <input
              type='submit'
              className={IsLogIn ? styles.default.logIn : styles.default.signUp}
              value='Submit'
              onClick={this.OnSumitClick}
            /></div>
          </form>
          <SwitchForm IsLogIn={IsLogIn} />
        </div>
      </div>
    );
  }
}

export default connect(Dependencies, (deps, ownProps: IFormProps) => ({
  UserService: deps.UserService,
  history: ownProps.history,
  IsLogIn: ownProps.IsLogIn,
  match: ownProps.match,
  location: ownProps.location,
  setErrorMessage:ownProps.setErrorMessage
}))(Form);
