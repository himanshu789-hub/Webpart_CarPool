import * as React from "react";
import { UserDTO } from "../../model/User";
import Redirection from "./components/Redirection/Redirection";
import { arrayBufferToBase64, GoToPath } from "../../utilities/utilities";
import profileImg from "../../../public/assests/profile.png";
import { NamePattern, PasswordPattern, EmailPattern } from "./locales/regexp";
import { APIServer, UploadServer } from "../../constant/connection";
import IUserService, { UserService } from "../../service/UserService";
import { connect, injectable, inject } from "react-inversify";
import "./css/styles.css";
import { ConstUserService } from "../../constant/injection";

interface IFormProps {
  history: any;
  match: any;
  location: any;
  IsLogIn: boolean;
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
  User?: UserDTO;
  showPassword: boolean;
  ImageSelected: string;
  ImageUploaded: any;
  ImageName: string;
  msg: string;
  isOnUpdate: boolean;
  src: any;
  confirmPassword: string;
  emailMsg: string;
  nameMsg: string;
  passwordMsg: string;
  isImageUploaded: boolean;
  imageMsg: string;
  ageMsg: string;
  genderMsg: string;
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
        EmailId: "",
        Active: true,
        Name: "",
        Password: "",
        ImageUploadedName: "",
        Age: 0,
        Gender: "",
      },
      showPassword: false,
      ImageSelected: "",
      IsLogIn: this.props.IsLogIn,
      ImageUploaded: null,
      ImageName: "",
      src: profileImg,
      msg: "",
      isOnUpdate: id == undefined ? false : true,
      confirmPassword: "",
      emailMsg: "",
      nameMsg: "",
      passwordMsg: "",
      isImageUploaded: false,
      imageMsg: "",
      ageMsg: "",
      genderMsg: "",
    };

    this.OnSumitClick = this.OnSumitClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
    this.onSubmitValidate = this.onSubmitValidate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.ImageUpload = this.ImageUpload.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }
  handleDelete(event) {
    event.preventDefault();
    const { UserService, history } = this.props;
    const { Id } = this.state.User;
    UserService.Delete(Id).then(response => {
      if (response.data) history.push("/");
      else {
        this.setState({ msg: "Please Try Again To Delete Account" });
      }
    });
  }
  componentDidMount() {
    const { match, UserService } = this.props;
    const { params } = match;
    const { id } = params;

    if (id != undefined) {
      UserService.GeyUserById(Number(id))
        .then(response => {
          this.setState({
            User: response.data,
            isOnUpdate: true,
            ImageName: response.data.ImageUploadedName,
            isImageUploaded: true,
          });
          return UserService.GetImage(response.data.ImageUploadedName);
        })
        .then(response => {
          this.setState({
            src: arrayBufferToBase64(response.data),
            ImageUploaded:response.data,isImageUploaded:true
          });
        });
    } else {
      const user: UserDTO = new UserDTO();
      this.setState({
        isOnUpdate: false,
        User: { ...user },
        src: profileImg,
      });
    }
  }
  togglePassword() {
    this.setState(state => ({ showPassword: !state.showPassword }));
  }

  async ImageUpload() {
    const {UserService} = this.props;
    let data = new FormData();
    data.append("file", this.state.ImageUploaded);
    await UserService.UploadImage(data).then(res=>{
    if(res.status==200){
    const data = JSON.parse(res.data);
    this.setState({
        ImageSelected: data.FileName,
        ImageName: data.FileName,
        isImageUploaded: true,
      });
    }
   }).catch(err=>{
     this.setState({msg:'File Is Not Uploaded Due To Server Error',ImageUploaded:null});
   });
  }

  onFileUpload = event => {
    event.preventDefault();
    const { files } = event.target;
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = event => {
        const { result } = event.target;
        this.setState({
          src: result,
          ImageName: file.name,
          ImageUploaded: file,
        });
      };
    }
  }
  
  handleChange(event) {
    const { name, value } = event.target;

    if (
      name == "Name" ||
      name == "EmailId" ||
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
  handleCancel() {
    const { history,location } = this.props;
    const {pathname} = location;
    const { id } = this.props.match.params;
    history.push(GoToPath(pathname,'content'));
  }
  onSubmitValidate() {
    let validateResult: boolean = true;
    const { isImageUploaded, confirmPassword, IsLogIn } = this.state;
    const {
      Password: password,
      Name: name,
      EmailId: emailId,
      Age: age,
      Gender: gender,
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
    if (age < 18) {
      this.setState({ ageMsg: "Please, Enter Valid Age" });
      validateResult = false;
    } else this.setState({ ageMsg: "" });
    return validateResult;
  }

  async OnSumitClick(event) {
    event.preventDefault();
    const { IsLogIn, UserService } = this.props;
    if (IsLogIn) {
      const { EmailId: emailId, Password: password } = this.state.User;
      let tempUser: UserDTO;
      UserService.LogIn(emailId, password).then(res => {
        tempUser = res.data;
        if (tempUser != null) {
          this.props.history.push("/home/" + tempUser.Id + "/content");
        } else {
          this.setState({
            msg: "Please, Enter valid Credentials ",
          });
        }
      });
    } else {
      if (!this.onSubmitValidate()) return;
      const { isOnUpdate } = this.state;
      const { history } = this.props;
      const { User,ImageUploaded } = this.state;

      let tempUser: UserDTO = {
        EmailId: "",
        Name: "",
        Active: true,
        ImageUploadedName: "",
        Password: "",
        Gender: "",
        Age: 0,
      };
      tempUser = { ...User };
      if (isOnUpdate) {
        if (ImageUploaded) {
          await this.ImageUpload();
          const { ImageSelected } = this.state;
          tempUser.ImageUploadedName = ImageSelected;
        }
        await UserService.Update(tempUser).then(res => {
          tempUser = res.data;
        });
      } else {
        await this.ImageUpload();
        const { ImageSelected } = this.state;
        tempUser.ImageUploadedName = ImageSelected;
        await UserService.Create(tempUser).then(res => {
          tempUser = res.data;
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
      confirmPassword,
      ageMsg,
      genderMsg,
    } = this.state;

    return (
      <div id='container'>
        <div id='image'></div>
        <div id='formBar' className={IsLogIn ? "signUp" : "logIn"}>
          <form id='form' onSubmit={this.OnSumitClick}>
            <label>
              {isOnUpdate ? "Update Profile" : IsLogIn ? "Log In" : "Sign Up"}
            </label>
            <label className={"msg-display"}>{msg}</label>
            {IsLogIn ? (
              ""
            ) : (
              <>
                <div>
                  <label className='form-msg'>{nameMsg}</label>
                  <input
                    type='text'
                    name='name'
                    autoComplete='off'
                    className='inputText'
                    required
                    value={User.Name || ""}
                    onChange={this.handleChange}
                  />
                  <span className='floating-label'>Enter Your Name</span>
                </div>
                <div>
                  <div className='ageSection'>
                    <label className='form-msg'>{ageMsg}</label>
                    <input
                      type='text'
                      name='age'
                      required
                      autoComplete='off'
                      value={User.Age || ""}
                      onChange={this.handleChange}
                    />
                    <span className='floating-label'>Enter Your Age</span>
                  </div>
                  <div className='genderSection'>
                    <label className='form-msg'>{genderMsg}</label>
                    <select
                      id='gender'
                      name='gender'
                      className='inputText'
                      defaultValue='Male'
                      onChange={this.handleChange}
                    >
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            <div>
              <label className='form-msg'>{emailMsg}</label>
              <input
                type='text'
                name='emailId'
                className='inputText'
                autoComplete={"off"}
                required
                value={User.EmailId || ""}
                onChange={this.handleChange}
              />
              <span className='floating-label'>Enter Your Mail-Id</span>
            </div>

            <div className='password'>
              <label className='form-msg'>{passwordMsg}</label>
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                autoComplete='off'
                className='inputText'
                required
                value={User.Password || ""}
                onChange={this.handleChange}
              />
              <span className='floating-label'>Your Password</span>
            </div>
            <label id='passEye' onClick={this.togglePassword}>
              {!showPassword ? (
                <i className='fas fa-eye'></i>
              ) : (
                <i className='fas fa-eye-slash'></i>
              )}
            </label>
            {IsLogIn ? (
              " "
            ) : (
              <>
                {" "}
                <div className='password'>
                  <label className='form-msg'></label>
                  <input
                    type='password'
                    name='confirmPassword'
                    autoComplete='off'
                    value={confirmPassword || ""}
                    className='inputText'
                    required
                    onChange={this.handleChange}
                  />
                  <span className='floating-label'>Confirm Password</span>
                </div>
                <div className='upload'>
                  <input
                    type='file'
                    onChange={this.onFileUpload}
                    id='fileChoose'
                  />

                  <label htmlFor='fileChoose' className='uploadButton'>
                    Upload
                  </label>
                  <img src={src} className='image' alt='Image' />
                </div>
                <label className='form-msg form-upload-msg'>{imageMsg}</label>
              </>
            )}
            {isOnUpdate ? (
              <aside className='update-section'>
                {" "}
                <button className='delete-button' onClick={this.handleDelete}>
                  Delete
                </button>
                <label className='cancel-label' onClick={this.handleCancel}>
                  <i className='fas fa-ban'></i>
                </label>
              </aside>
            ) : (
              <></>
            )}
            <input
              type='submit'
              className={IsLogIn ? "logIn" : "signUp"}
              value='Submit'
              onClick={this.OnSumitClick}
            />
          </form>
          <Redirection IsLogIn={IsLogIn} />
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
}))(Form);
