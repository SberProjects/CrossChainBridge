import React from "react";
import './loaders.css'

const ErrComp = props => {
    return (
        <div className="error_container">
            <p>ОШИБКА:</p>
            <p>{props.errMes}</p>
            <button onClick={() => window.location.reload()}>Перезагрузить</button>
        </div>
    )
}

export {ErrComp}