import * as React from 'react'
import { Link } from 'react-router-dom';
import * as styles from './scss/styles.module.scss';

interface IRedirection
{
    IsLogIn:boolean
}    
export default function SwitchForm(props:IRedirection)
{
    const { IsLogIn } = props;
    return IsLogIn ? (<p className={styles.default.footer}>Not A Member Yet?<span> <Link to="/">SIGN UP</Link></span></p>) :
        (<p className={styles.default.footer}>Already a member?<span> <Link to="/login">LOG IN</Link></span></p>);
}