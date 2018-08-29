import Inferno from 'inferno';
import Component from 'inferno-component';

export class TypeFilterControl extends Component{
    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        this._input.focus()
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside(event) {

        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            console.log("click outside", event.target)
            this.props.onBlur()
        }
    }

    render() {
        let {filterValue, onInput, onBlur} = this.props;

        return (<div ref={this.setWrapperRef} className="filter-control-inner" style="
        position: absolute;
        z-index: 1000;
        width: 200px;
        height: 88px;
        background: white;
        color: white;
        border: 1px solid #ccc;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06); font-size: 16px;">
        <input
            style="margin: 12px 5px 5px 9px; width: 180px; height: 29px; font-size: 16px; "
            type="text"
            ref={(x) => { this._input = x }}
            value={filterValue}
            spellCheck="false"
            onInput={(e) => onInput(e.target.value)}
            onKeyPress={(e) => {if (e.key == "Enter") onBlur() }}/>
        <button
            style="
            line-height: 1.8;
            box-shadow: none;
            border-radius: 0px;
            color: rgb(255, 255, 255);
            background-color: rgb(100, 150, 200);
            outline: none;
            border-style: none;
            float: right;
            margin: 3px 5px 10px 5px;
            font-size: 16px;
            "
             onClick={() => { onInput(''); onBlur() }}>Clear</button>
        </div>)
    }


}