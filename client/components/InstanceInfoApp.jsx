import Inferno from 'inferno';
import Component from 'inferno-component';
import InfoToolbar from './InfoToolbar.jsx';
import Settings from './Settings.jsx';

import 'whatwg-fetch'
import 'es6-promise'

const defaultSettings = {
    tab: 'cpuinfo'
}

function isPreRender() {
    return window.location.hostname == "localhost" && navigator.userAgent.indexOf("PhantomJS") != -1
}

const M4_WARNING = "Note: CPU architecture for smaller m4 instance types can vary (could be either Broadwell or Haswell)."
const T2_WARNING = "Note: CPU architecture for t2 instance types can vary."
const C1_WARNING = "Note: CPU architecture for c1 instance types can vary."
const M1_WARNING = "Note: CPU architecture for m1 instance types can vary."
const M2_WARNING = "Note: CPU architecture for m2 instance types can vary."
const T1_WARNING = "Note: CPU architecture for t1 instance type can vary."

const WARNINGS = {
    "m4.large": M4_WARNING,
    "m4.xlarge": M4_WARNING,
    "m4.2xlarge": M4_WARNING,
    "m4.4xlarge": M4_WARNING,
    "t2.nano": T2_WARNING,
    "t2.micro": T2_WARNING,
    "t2.small": T2_WARNING,
    "t2.medium": T2_WARNING,
    "t2.large": T2_WARNING,
    "t2.xlarge": T2_WARNING,
    "t2.2xlarge": T2_WARNING,
    "c1.medium": C1_WARNING,
    "c1.xlarge": C1_WARNING,
    "m1.medium": M1_WARNING,
    "m1.large": M1_WARNING,
    "m1.xlarge": M1_WARNING,
    "m2.xlarge": M2_WARNING,
    "m2.2xlarge": M2_WARNING,
    "m2.4xlarge": M2_WARNING,
    "t1.micro": T1_WARNING
}

class InstanceWarning extends Component {
    render() {
        console.log(this.props.instanceType, WARNINGS[this.props.instanceType])
        if (WARNINGS[this.props.instanceType]) {
            return (
                <p className="cpuinfo-warning">{WARNINGS[this.props.instanceType]}</p>
            )
        }
    }
}

class ConsoleOutput extends Component {
    render() {
        return (<pre className="console-block">{this.props.text}</pre>)
    }
}

class CpuInfo extends Component {
    constructor(props) {
        super(props)
        this.update()
    }

    update() {
        let url = "/data/info/" + this.props.instanceType + "/cpuinfo.txt"
        if (isPreRender())
            url = "http://localhost:3000" + url;

        fetch(url).then(a => a.text()).then(function(j) {
            this.setState({cpuinfo: j})
        }.bind(this));
    }

    render() {
        return (<ConsoleOutput text={this.state.cpuinfo}/>)
    }
}

class TopoInfo extends Component {
    render() {
        let url = "/data/info/" + this.props.instanceType + "/lstopo.svg"
        return (<div className="topo-img"><img src={url}/></div>)
    }
}

export default class InstanceInfoApp extends Component {
  constructor(props) {
    super(props)

    this.state.settings = new Settings(this.onChange.bind(this),
                                       window.location.hash,
                                       defaultSettings,
                                       undefined,
                                       true)

  }

  onChange(hash, diff) {
    this.setState({hash:hash});
  }

  render() {
    let upd_text = "";

    if (this.state.lastUpdated) {
        let d = new Date(this.state.lastUpdated)
        upd_text = "Last updated " + d.toLocaleDateString();
    }

    let tw = "";
    if (!isPreRender()) {
        tw = (<div className="social-container">
        <a class="twitter-share-button"
        href="https://twitter.com/intent/tweet?text=Instance%20price%20guide"
        data-size="large">
        Tweet</a>
        </div>)
    }

    let tab = "";
    switch (this.state.settings.tab) {
        case "cpuinfo":
            tab = (<CpuInfo instanceType={this.props.instanceType}/>)
            break;
        case "lstopo":
            tab = (<TopoInfo instanceType={this.props.instanceType}/>)
            break;
        default:
            break;
    }

    document.title = this.props.instanceType;

    return (
     <div>
        <div className="header">
        <h1><a href="/"><img className="logo" src="cloud.svg" alt="Kiwi standing on oval"/>AWS Instance Price Guide</a></h1>
        <p className="update-text">{upd_text} &#8226; For informational purposes only. This page is not affiliated with Amazon. <a href="mailto:feedback@instaguide.io">feedback@instaguide.io</a> </p>
        {tw}

        </div>
        <div className="content">
        <h2>{this.props.instanceType}<a href="/" className="back-link"> &lt;&lt;back to pricing info</a></h2>
        <InfoToolbar settings={this.state.settings}
                     tab={this.state.settings.tab}/>
        <div className="info-tab">
        <InstanceWarning instanceType={this.props.instanceType}/>
        {tab}
        </div>
        </div>
      </div>);
  }
}



// WEBPACK FOOTER //
// ./client/components/InstanceInfoApp.jsx