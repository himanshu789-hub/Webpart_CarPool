import * as React from 'react';
import * as styles from './scss/styles.module.scss';
interface IDisplayErrorProps{
    showError: boolean;
    msg: string;
    ToggleShowErrorMessage: Function;
}
interface IDisplayErrorState{
    showError: boolean;
}
export default class DisplayError extends React.Component<IDisplayErrorProps,IDisplayErrorState>
{
    constructor(props: IDisplayErrorProps) {
        super(props);
        const { showError } = this.props;
        this.state = {
            showError
        };
        this.handleCancelClick = this.handleCancelClick.bind(this);
    }

    handleCancelClick() {
        
        const { ToggleShowErrorMessage } = this.props;
            
        ToggleShowErrorMessage(false);
    }
    render()
    {
        const { showError, msg } = this.props;
        if (!showError)
            return <React.Fragment></React.Fragment>;
            
        return (<div className={styles.default.errorContainer}>
                <p>{msg || "error loading"}</p>
                <button onClick={this.handleCancelClick}><i className="fa fa-times" aria-hidden="true"></i></button>
            </div>);
    
    }
}
