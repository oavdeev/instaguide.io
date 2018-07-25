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

    return (
     <div>
        <div className="header">
        <h1><a href="/"><img className="logo" src="cloud.svg" alt="Kiwi standing on oval"/>AWS Instance Price Guide</a></h1>
        <p className="update-text">{upd_text} &#8226; For informational purposes only. This page is not affiliated with Amazon. <a href="mail:feedback@instaguide.io">feedback@instaguide.io</a> </p>
        {tw}

        </div>
        <div className="content">
        <h2>{this.props.instanceType}</h2>
        <InfoToolbar settings={this.state.settings}
                     tab={this.state.settings.tab}/>
        <div className="info-tab">
        {tab}
        </div>
        </div>
      </div>);
  }
}



// WEBPACK FOOTER //
// ./client/components/InstanceInfoApp.jsx