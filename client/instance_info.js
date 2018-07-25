import Inferno from 'inferno';
import InstanceInfoApp from './components/InstanceInfoApp.jsx';
import './style.scss'
import 'inferno-devtools'
import * as Utils from './components/Utils.js'

function run() {
    let params = Utils.getUrlParams();
    Inferno.render(<InstanceInfoApp instanceType={params.type}/>, document.getElementById('root'));
}

const loadedStates = ['complete', 'loaded', 'interactive'];

run();
/*
if (loadedStates.includes(document.readyState) && document.body) {
  run();
} else {
  window.addEventListener('DOMContentLoaded', run, false);
}

*/