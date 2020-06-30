import * as React from 'react';

interface IErrorBoundaryState{

  error:any;
  errorInfo: any;

}
export default class ErrorBoundary extends React.Component<{},IErrorBoundaryState> {
    constructor(props) {
      super(props);
      this.state = { error:null,errorInfo:null };
    }
  
  
    componentDidCatch(error, errorInfo) {
      debugger;
      this.setState({ error, errorInfo });
    }
  
    render() {
      if (this.state.errorInfo) {
        // You can render any custom fallback UI
        return <React.Fragment>
          <h1>Opps! Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </React.Fragment>;
      }
  
      return this.props.children; 
    }
  }