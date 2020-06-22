import * as React from "react";
import { User } from "../../model/User";
import SwitchForm from "./components/SwitchForm/SwitchForm";
import { GoToPath } from "../../utilities/utilities";
import { NamePattern, PasswordPattern, EmailPattern } from "./locales/regexp";
import { connect, injectable, inject } from "react-inversify";
import { ConstUserService } from "../../constant/injection";
import * as styles from './scss/styles.module.scss';
import { IUserService } from "../../interface/IUserService";
import { IUser } from "../../interface/IUser";
import { SPHttpClient } from '@microsoft/sp-http';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Logo from './../Logo/Logo';

interface TParams  {
  id: string;
}
interface IFormProps extends RouteComponentProps<TParams> {
  IsLogIn: boolean;
  spHttpClient: SPHttpClient;
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
  IsImageUploaded:boolean;
  ImageName: string;
  msg: string;
  isOnUpdate: boolean;
  src: string;
  confirmPassword: string;
  emailMsg: string;
  nameMsg: string;
  passwordMsg: string;
  isImageUploaded: boolean;
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
        Contact: '',
        EMail: '',
        FullName: '',
        Id: 0,
        Password: '',
        ProfileImageUrl:''
      },
      showPassword: false,
      IsLogIn: this.props.IsLogIn,
      src:'data:image/png;base64,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',
      msg: "",
      isOnUpdate: id == undefined ? false : true,
      confirmPassword: "",
      emailMsg: "",
      nameMsg: "",
      passwordMsg: "",
      isImageUploaded: false,
      imageMsg: "",
      ImageName: '',
      IsImageSelected: false,
      IsImageUploaded:false
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

  componentDidMount() {
    const { match, UserService,spHttpClient } = this.props;
    const {params} = match;
    const { id } = params;
    
    if (id != undefined) {
      UserService.GeyUserById(parseInt(id),spHttpClient)
        .then(respone => {
          this.setState({
            User: { ...respone },
            src:respone.ProfileImageUrl
          });
        });
    } else {
      const user: IUser = new User();
      this.setState({
        isOnUpdate: false,
        User: { ...user },
        src: '',
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
          ImageName: file.name
        });
      };
    }
  }
  
  HandleChange(event) {
    const { name, value } = event.target;
    debugger;
    if (
      name == "Name" ||
      name == "EMail" ||
      name == "Password" ||
      name == "Gender" ||
      name == "Age"
    ) {
      this.setState(state => {
        return { User: { ...state.User, [name]: value } };
      });
    } else {
      const newKey = {};
      newKey[name] = value;
      this.setState(newKey);
    }
  }
  HandleCancel() {
    const { history, location, match} = this.props;
    const { } = match;
    const {pathname} = location;
    const { id } = this.props.match.params;
    history.push(GoToPath.Home(parseInt(id)));
  }
  OnSubmitValidate() {
    let validateResult: boolean = true;
    const { isImageUploaded, confirmPassword, IsLogIn } = this.state;
    const {
      Password: password,
      FullName: name,
      EMail: emailId,
     } = this.state.User;

    if (password != confirmPassword) {
      this.setState({
        msg: "Your Password Do Not Match With Confirm Password",
      });
      validateResult = false;
    } else this.setState({ msg: "" });
    if (name.length == 0 || !NamePattern.test(name)) {
      this.setState({ nameMsg: "Please Enter Valid Name" });
      validateResult = false;
    } else this.setState({ nameMsg: "" });

    if (emailId.length == 0 || !EmailPattern.test(emailId)) {
      this.setState({ emailMsg: "Please Enter Valid EmailId" });
      validateResult = false;
    } else this.setState({ emailMsg: "" });
    if (password.length == 0 || !PasswordPattern.test(password)) {
      validateResult = false;
      this.setState({ passwordMsg: "Please Enter Valid Password" });
    } else this.setState({ passwordMsg: "" });

    if (!isImageUploaded) {
      this.setState({ imageMsg: "Please, Upload an image" });
      validateResult = false;
    } else this.setState({ imageMsg: "" });
   
    return validateResult;
  }

  async OnSumitClick(event) {
    event.preventDefault();
    const { IsLogIn, UserService,spHttpClient,history } = this.props;
    if (IsLogIn) {
      const { EMail: emailId, Password: password } = this.state.User;
      let tempUser: IUser;
      UserService.LogIn(emailId, password,spHttpClient).then(res => {
        tempUser = {...res};
        if (tempUser != null) {
          history.push(GoToPath.Home(tempUser.Id));
        } else {
          this.setState({
            msg: "Please, Enter valid Credentials ",
          });
        }
      }).catch((error:Error) => {
        this.setState({ msg: error.message });
      });
    } else {
      if (!this.OnSubmitValidate()) return;
      const { isOnUpdate } = this.state;
      const { history,spHttpClient } = this.props;
      const { User } = this.state;

      let tempUser: IUser ={...User};
      tempUser = { ...User };
      if (isOnUpdate) {
        await UserService.Update(tempUser,spHttpClient).then(res => {
        }).catch((error: Error) => {
          this.setState({ msg: error.message });
        });
      } else {
        const Id = await UserService.GetCurrentUserLogInId();
        await UserService.Create(tempUser,Id,spHttpClient).then(res => {
          tempUser = {...res};
        }).catch((error:Error) => {
          this.setState({ msg: error.message });
        });
      }
      history.push("/home/" + tempUser.Id + "/content");
    }
  }

  render() {
    const {
      src,
      nameMsg,
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
          <form id='form' onSubmit={this.OnSumitClick}>
            <label>
              {isOnUpdate ? "Update Profile" : IsLogIn ? "Log In" : "Sign Up"}
            </label>
            <label className={"msg-display"}>{msg}</label>
            <div className={styles.default.msg_input_container}>
              <label className='form-msg'>*&nbsp;{emailMsg}</label>
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
              <span className={""}>Enter Your Mail-Id</span>
            </div></div>

            <div className={styles.default.msg_password_input_container}>
              <label className='form-msg'>{passwordMsg}</label>
              <div  className={styles.default["input-container"]}><input
                type="text"
                name='Password'
                placeholder=" "
                autoComplete='off'
                className='inputText'
                required
                value={showPassword?User.Password:User.Password.replace(/./g,'*') || ""}
                onChange={this.HandleChange}
              />
                <span className='floating-label'>Your Password</span></div>
                {/* <label className={styles.default.togglePassword} onClick={this.TogglePassword}>
              {!showPassword ? (
                <i className='fas fa-eye'></i>
              ) : (
                <i className='fas fa-eye-slash'></i>
              )}
            </label> */}
            </div>
            {IsLogIn ? (
              " "
            ) : (
              <>
                  {" "}
                  <div className={styles.default.msg_input_container}>
                  <label className='form-msg'></label>
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
                  <div className={styles.default.imageBorder}><img src={src} className='image' alt='Image' /></div>
                </div>
                <label className='form-msg form-upload-msg'>{imageMsg}</label>
              </>
            )}
            {isOnUpdate ? (
              <aside className='update-section'>
                {" "}
                <button className='delete-button' onClick={this.HandleDelete}>
                  Delete
                </button>
                <label className='cancel-label' onClick={this.HandleCancel}>
                  <i className='fas fa-ban'></i>
                </label>
              </aside>
            ) : (
              <></>
            )}
            <div className={styles.default.submitSection}>
              <input
              type='submit'
              className={IsLogIn ? "logIn" : "signUp"}
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

export default withRouter(connect(Dependencies, (deps, ownProps: IFormProps) => ({
  UserService: deps.UserService,
  history: ownProps.history,
  IsLogIn: ownProps.IsLogIn,
  match: ownProps.match,
  location: ownProps.location,
}))(Form));
