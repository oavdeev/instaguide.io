import Inferno from 'inferno';
import Component from 'inferno-component';
import Dropdown from './Dropdown.jsx';
import Selector from './Selector.jsx';
import Checkbox from './Checkbox.jsx';

const regions = [
{code: "us-east-1", name: "US East (N. Virginia)"},
{code: "us-east-2", name: "US East (Ohio)"},
{code: "us-west-1", name: "US West (N. California)"},
{code: "us-west-2", name: "US West (Oregon)"},
{code: "ca-central-1", name: "Canada (Central)"},
{code: "eu-west-1", name: "EU (Ireland)"},
{code: "eu-central-1", name: "EU (Frankfurt)"},
{code: "eu-west-2", name: "EU (London)"},
{code: "ap-northeast-1", name: "Asia Pacific (Tokyo)"},
{code: "ap-northeast-2", name: "Asia Pacific (Seoul)"},
{code: "ap-southeast-1", name: "Asia Pacific (Singapore)"},
{code: "ap-southeast-2", name: "Asia Pacific (Sydney)"},
{code: "ap-south-1", name: "Asia Pacific (Mumbai)"},
{code: "sa-east-1", name: "South America (São Paulo)"}
//,{code: "us-gov-west-1", name: "AWS GovCloud (US)"}
];


class RegionDropdown extends Component {
    render() {

        const options = regions.map((x) => ({value: x.code, label: x.name}))
        return (<div className="region-dropdown dropdown">
                    <label>Region: </label>
                    <Dropdown
                          options={options}
                          onChange={x => this.props.settings.set({regionCode: x.value})}
                          value={this.props.regionCode}/>
                </div>);
    }
}

class TenancyDropdown extends Component {
    render() {
        const tenancies = [
            {code:"shared", name:"Shared"},
            {code:"dedicated", name:"Dedicated"}
        ];

        const options = tenancies.map(x => ({value: x.code, label: x.name}))
        return (<div className="tenancy-dropdown dropdown">
                    <label>Tenancy: </label>
                    <Dropdown
                          options={options}
                          onChange={x => this.props.settings.set({tenancyCode: x.value})}
                          value={this.props.tenancyCode}/>
                </div>);
    }
}

class PlatformDropdown extends Component {
    render() {
        const platforms = [
            {code: "linux", name: "Linux"},
            {code: "rhel", name: "RHEL"},
            {code: "suse", name: "SUSE"},
            {code: "windows", name: "Windows"},
            {code: "windows_sql_std", name: "Windows + SQL Std"},
            {code: "windows_sql_web", name: "Windows + SQL Web"},
        ];

        const options = platforms.map(x => ({value: x.code, label: x.name}))
        return (<div className="platform-dropdown dropdown">
                    <label>Platform: </label>
                    <Dropdown
                          options={options}
                          onChange={x => this.props.settings.set({platform: x.value})}
                          value={this.props.platform}/>
                </div>);
    }
}


class PriceCalcSelector extends Component {
    render() {
        const calc_options = [
            {code: "abs", name: "Absolute $$"},
            {code: "ond", name: "% of On-Demand"},
            {code: "ram", name: "$ Per GiB of RAM"},
            {code: "vcpu", name: "$ Per vCPU"},
        ];

        const options = calc_options.map(x => ({value: x.code, label: x.name}))
        return (<Selector className="pc-control pricecal-selector"
                          options={options}
                          onChange={x => this.props.settings.set({priceCalc: x.value})}
                          value={this.props.priceCalc||"none"}/>);
    }
}

class PeriodSelector extends Component {
    render() {
        const calc_options = [
            {code: "hr", name: "Hour"},
            {code: "dy", name: "Day"},
            {code: "mo", name: "Month"},
            {code: "yr", name: "Year"},
        ];

        const options = calc_options.map(x => ({value: x.code, label: x.name}))
        return (<Selector className="pc-control period-selector" 
                          options={options}
                          onChange={x => this.props.settings.set({period: x.value})}
                          value={this.props.period}/>);
    }
}


class ReservationTermDropdown extends Component {
    render() {
        const reservation_terms = [
            {code: "1yr_std_noup", name: "1yr No Upfront"},
            {code: "1yr_std_partup", name: "1yr Partial Upfront"},
            {code: "1yr_std_allup", name: "1yr All Upfront"},
            {code: "3yr_std_noup", name: "3yr No Upfront"},
            {code: "3yr_std_partup", name: "3yr Partial Upfront"},
            {code: "3yr_std_allup", name: "3yr All Upfront"},
            {code: "3yr_conv_noup", name: "3yr No Upfront Convertible"},
            {code: "3yr_conv_partup", name: "3yr Partial Upfront Convertible"},
            {code: "3yr_conv_allup", name: "3yr All Upfront Convertible"},
        ];

        const options = reservation_terms.map(x => ({value: x.code, label: x.name}))
        return (<div className="reservationTerm-dropdown dropdown">
                    <label>Reservation: </label>
                    <Dropdown
                          options={options}
                          onChange={x => this.props.settings.set({reservationTerm: x.value})}
                          value={this.props.reservationTerm}/>
                </div>);
    }
}

export default class Toolbar extends Component {
    render() {
        return (<div className="toolbar show-advanced">
            <div className="other-controls">
            <RegionDropdown settings={this.props.settings}
                            regionCode={this.props.regionCode}/>
            <PlatformDropdown settings={this.props.settings}
                             platform={this.props.platform}/>
            <ReservationTermDropdown settings={this.props.settings}
                             reservationTerm={this.props.reservationTerm}/>
            <TenancyDropdown settings={this.props.settings}
                             tenancyCode={this.props.tenancyCode}/>
            <Checkbox className="typesFilter-checkbox"
                                    isChecked={this.props.typesFilter=="current"}
                                    onChange={x => this.props.settings.set({typesFilter:x?"current":"all"})}
                                    label="Current Gen Only"/>
            </div>
            <div className="price-controls">
                <PriceCalcSelector settings={this.props.settings}
                                   priceCalc={this.props.priceCalc}/>
                <PeriodSelector settings={this.props.settings}
                                period={this.props.period}/>
            </div>
            <div className="clear"/>
        </div>)
    }
}