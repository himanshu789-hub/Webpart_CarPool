import * as React from 'react'
import { Link } from 'react-router-dom';

interface IRedirection
{
    IsLogIn:boolean
}    
export default function Redirection(props:IRedirection)
{
    const { IsLogIn } = props;
    return IsLogIn ? (<p>Not A Member Yet?<span className="underline"> <Link to="/">SIGN UP</Link></span></p>) :
        (<p>Already a member?<span className="underline"> <Link to="/login">LOG IN</Link></span></p>);
}