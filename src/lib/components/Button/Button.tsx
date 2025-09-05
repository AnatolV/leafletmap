import "./Button.css"
import type {TLocale} from "../LeafletMap/LeafletMap.types.ts";
interface IButton {
    handleOpen:()=>void
    locale:TLocale
}
const Button=(props:IButton)=> {
    return (
        <button className='map-button' onClick={props.handleOpen}>
            {props.locale === 'ru' ? 'Открыть карту' : 'Відкрити мапу'}
        </button>
    );
}
export default Button;
