import Inferno from 'inferno';
import Component from 'inferno-component';
import Dropdown from './Dropdown.jsx';
import Selector from './Selector.jsx';
import Checkbox from './Checkbox.jsx';


class InfoTabSelector extends Component {
    render() {
        const options = [
            {value: "cpuinfo", label: "CPU Info"},
            {value: "lstopo", label: "Topology"},
        ];
        return (<Selector className="pc-control"
                          options={options}
                          onChange={x => this.props.settings.set({tab: x.value})}
                          value={this.props.tab}/>);
    }
}

export default class InfoToolbar extends Component {
    render() {
        return (<div className="info-toolbar">
                <InfoTabSelector settings={this.props.settings} tab={this.props.tab}/>
                <div className="clear"/>
                </div>)
    }
}