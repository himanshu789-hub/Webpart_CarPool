import * as React from 'react';
import { ICarPoolProps } from './ICarPoolProps';
import  Form  from './Form/Form';
import Home from './Home/Home';
import { container } from './../loc/car-pool-ioc';
import { Switch, Route, HashRouter,RouteComponentProps } from 'react-router-dom';
import { Provider } from 'react-inversify';
import * as styles from './CarPool.module.scss';
import ErrorBoundary from './shared/ErrorBoundary/ErrorBoundary';
import DisplayError from './shared/DisplayError/DisplayError';
 interface ICarPoolState{
  showError: boolean;
  msg: string;
}
import NotFound from './shared/NotFound/NotFound';
export default class CarPool extends React.Component<ICarPoolProps,ICarPoolState> {
  
  constructor(props) {
    super(props);
    this.state = {
      showError: false,
      msg:null
    };
    this.SetErrorMessage = this.SetErrorMessage.bind(this);
  }
  SetErrorMessage(showError: boolean, msg: string=null) {
    this.setState({ showError, msg });
  }
  public render(): React.ReactElement<ICarPoolProps> {
    const { showError,msg } = this.state;
    return (
      <React.Fragment>
        <DisplayError showError={showError} msg={msg} ToggleShowErrorMessage={this.SetErrorMessage}/>
     <HashRouter>
        <Provider container={container}>
        <ErrorBoundary>
         <Switch>
                <Route path='/home/:id' render={(props) => <Home {...this.props} {...props} setErrorMessage={this.SetErrorMessage}/>}  />
           <Route
              path='/login'
              render={props => <Form {...this.props } {...props}  IsLogIn={true} setErrorMessage={this.SetErrorMessage}/>}
           />
           <Route
              exact
              path={["/", "/profile/:id"]}
              render={props => <Form {...this.props} {...props} IsLogIn={false} setErrorMessage={this.SetErrorMessage}/>}
                />
            <Route path="*" component={NotFound}/> 
           </Switch>
         </ErrorBoundary>
        </Provider>
        </HashRouter>
      </React.Fragment>)
    ;
  }
}
