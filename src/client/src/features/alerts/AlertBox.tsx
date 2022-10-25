import { uuid } from 'anytool';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AlertState, AlertType, removeAlert, removeAlertTimeout } from './alertSlice'

const AlertBox = (options: AlertState) => {

    const dispatch = useDispatch();

    useEffect(() => {
        if (options.endsIn) dispatch(removeAlertTimeout({ id: options.id, timeMs: options.endsIn }) as any)
    }, []);

    return (
        <div className={`main-alert alert-${options.type}`} key={uuid(30)}>
            <span className="alert-closebtn" onClick={() => {
                dispatch(removeAlert(options.id))
            }}>&times;</span>
            {options.title && <strong>{options.title + " "}</strong>}{options.message}
        </div>
    )
}

export default AlertBox