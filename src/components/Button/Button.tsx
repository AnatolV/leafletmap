import "./Button.css"
interface IButton {
    handleOpen:()=>void
    isUa:boolean
}
export function Button(props:IButton) {
    return (
        <button className="map-button" onClick={props.handleOpen}>
            {props.isUa ? 'Відкрити мапу' : 'Открыть карту'}
        </button>
    );
}
