import React from "react";
import './loaders.css';
import Tick from '../../assets/tick.svg'

const FinishLoader = props => {
    return (
        <div className="midloader_container">
            <img src={Tick} alt="tick-icon" className="tick_icon" />
            <p className="midLoader_message"> NFT успешно перемещен в {props.newBCH.name}</p>
            <p className="loader_lable">Смарт-контракт</p>
            <p className="loader_infoItem">{props.address}</p>
            <p className="loader_lable">ID NFT</p>
            <p className="loader_infoItem">{props.id}</p>
            <button onClick={() => window.location.href = '/transfer'}>Хорошо</button>
        </div>
    )
}

export { FinishLoader }