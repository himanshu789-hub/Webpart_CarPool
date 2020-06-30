import * as React from 'react';
import { ICarPoolProps } from './ICarPoolProps';
import  Form  from './Form/Form';
import Home from './Home/Home';
import { container } from './../loc/car-pool-ioc';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-inversify';
export default class CarPool extends React.Component<ICarPoolProps, {}> {
  public render(): React.ReactElement<ICarPoolProps> {
    return  <BrowserRouter>
        <Provider container={container}>
          <Switch>
            <Route path='/home/:id' component={Home} />
            <Route
              path='/login'
              render={props => <Form {...props} IsLogIn={true} />}
            />
            <Route
              exact
              path={["/", "/profile/:id"]}
              render={props => <Form {...props} IsLogIn={false} />}
            />
          </Switch>
        </Provider>
      </BrowserRouter>
    ;
  }
}
