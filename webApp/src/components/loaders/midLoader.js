import React from "react";
import './loaders.css';

const MidLoader = props => {
    return (
        <div className="midloader_container">
            <span className="loader"></span>
            <p className="midLoader_message">{props.mes}</p>
        </div>
    )
}

export { MidLoader }