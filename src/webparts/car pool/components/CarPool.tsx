import * as React from 'react';
import { ICarPoolProps } from './ICarPoolProps';
import  Form  from './Form/Form';
import Home from './Home/Home';
import { container } from './../loc/car-pool-ioc';
import { Switch, Route, HashRouter,RouteComponentProps } from 'react-router-dom';
import { Provider } from 'react-inversify';
import * as styles from './CarPool.module.scss';

export default class CarPool extends React.Component<ICarPoolProps, {}> {
  constructor(props) {
    super(props);
  }
  
  public render(): React.ReactElement<ICarPoolProps> {

    return <HashRouter>
        <Provider container={container}>
          <Switch>
            <Route path='/home/:id' component={Home} />
            <Route
              path='/login'
              render={props => <Form {...this.props }   IsLogIn={true} />}
            />
            <Route
              exact
              path={["/", "/profile/:id"]}
              render={props => <Form {...this.props} IsLogIn={false} />}
            />
          </Switch>
        </Provider>
      </HashRouter>
    ;
  }
}
