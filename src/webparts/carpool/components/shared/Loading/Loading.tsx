import * as React from 'react';
import * as ReactDOM from 'react-dom';
import loading from './image/loading.gif';
interface ILoadingProps{
    Show: boolean;
    width: number;
    height: number;
}
export default function Loading(props: ILoadingProps) {
    const { width, height, Show } = props;
    const styles = {
        display: "inline-block",
        width: `${width}px`
    };
    if (Show) {
        return <img src={loading} height={`${height}px`} style={{padding:"0px",...styles}}></img>
    }
    return <div style={{  padding: `${height}px 0 0 0`, ...styles }}></div>;
}