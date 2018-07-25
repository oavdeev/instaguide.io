import Inferno from 'inferno';
import App from './components/App.jsx';
import './style.scss'
import 'inferno-devtools'

function run() {
  Inferno.render(<App instances={[]}/>, document.getElementById('root'));
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