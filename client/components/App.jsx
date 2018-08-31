import Inferno from 'inferno';
import Component from 'inferno-component';
import InstanceTable from './InstanceTable.jsx';
import Toolbar from './Toolbar.jsx';
import Settings from './Settings.jsx';
import 'whatwg-fetch'
import 'es6-promise'

const defaultSettings = {
    sortField: "instanceType",
    sortDir: 1,
    regionCode: "us-west-2",
    platform: "linux",
    tenancyCode: "shared",
    reservationTerm: "1yr_std_partup",
    typesFilter: "current",
    priceCalc: "ond",
    period: "hr",
    cfType: ""
}

function makeQueryStr(d) {
    return Object.keys(d).map(x => x + "=" + d[x]).join("&");
}

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state.settings = new Settings(this.onChange.bind(this),
                                       window.location.hash,
                                       defaultSettings,
                                       ["sortField", "sortDir", "regionCode", "reservationTerm", "colFilter"])
    this.state.instances = props.instances;
    this.updateInstances();
  }

  onChange(hash, diff) {
    if (('regionCode' in diff)||('platform' in diff)||('tenancyCode' in diff))
        this.updateInstances();
    this.setState({hash:hash});
  }

  isPreRender() {
      return window.__PRERENDER_INJECTED === true
  }

  updateInstances() {
    var query = makeQueryStr({regionCode: this.state.settings.regionCode,
                              tenancyCode: this.state.settings.tenancyCode,
                              platform: this.state.settings.platform});
    //let url = "/api/instances/?" + query
    let url = "/data/instances/" + query + ".json"
    if (this.isPreRender())
        url = "http://localhost:3000" + url;

    fetch(url).then( r => r.json() ).then(function(j) {
        this.setState({instances:j.rows, lastUpdated:j.generatedTime})
    }.bind(this));

  }

  render() {
    let upd_text = "";
    if (this.state.lastUpdated) {
        let d = new Date(this.state.lastUpdated)
        upd_text = "Last updated " + d.toLocaleDateString();
    }

    let tw = "";
    if (!this.isPreRender()) {
        tw = (<div className="social-container">
        <a class="twitter-share-button"
        href="https://twitter.com/intent/tweet?text=Instance%20price%20guide"
        data-size="large">
        Tweet</a>
        </div>)
    }

    return (
     <div>
        <div className="header">
        <h1><a href="/"><img className="logo" src="cloud.svg" alt="Kiwi standing on oval"/>AWS Instance Price Guide</a></h1>
        <p className="update-text">{upd_text} &#8226; For informational purposes only. This page is not affiliated with Amazon. <a href="mailto:feedback@instaguide.io">feedback@instaguide.io</a> </p>

        {tw}

        <a href="https://github.com/oavdeev/instaguide.io/issues"  className="github-button"><button><img src="GitHub-Mark-64px.png"/><span>GitHub</span></button></a>

        </div>
        <div className="content">
        <Toolbar settings={this.state.settings}
                 regionCode={this.state.settings.regionCode}
                 tenancyCode={this.state.settings.tenancyCode}
                 reservationTerm={this.state.settings.reservationTerm}
                 platform={this.state.settings.platform}
                 typesFilter={this.state.settings.typesFilter}
                 period={this.state.settings.period}
                 priceCalc={this.state.settings.priceCalc}/>
        <InstanceTable instances={this.state.instances}
                       sortDir={this.state.settings.sortDir}
                       sortField={this.state.settings.sortField}
                       reservationTerm={this.state.settings.reservationTerm}
                       settings={this.state.settings}
                       typesFilter={this.state.settings.typesFilter}
                       period={this.state.settings.period}
                       priceCalc={this.state.settings.priceCalc}
                       cfType={this.state.settings.cfType}/>
        </div>
      </div>);
  }
}



// WEBPACK FOOTER //
// ./client/components/App.jsx