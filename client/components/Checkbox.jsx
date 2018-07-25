/* forked from https://github.com/nightwolfz/inferno-dropdown/ */
import Inferno from 'inferno'
import Component from 'inferno-component'
import classNames from 'classnames'


export default class Checkbox extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isChecked: props.isChecked
    }
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.isChecked && newProps.isChecked != this.state.isChecked) {
      this.setState({selected: newProps.isChecked})
    }
  }

  setValue (value) {
    let newState = {
      isChecked: value
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  toggle (ev) {
      console.log("toggle ", !(this.state.isChecked == true))
      this.setValue(!(this.state.isChecked == true))
      ev.preventDefault()
  }

  fireChangeEvent (newState) {
    if (newState.isChecked !== this.state.isChecked && this.props.onChange) {
      this.props.onChange(newState.isChecked)
    }
  }

  render () {

    return (
      <div className={this.props.className} >
        <div className={"selector-option" + ((this.state.isChecked)?" checked":" unchecked")} onClick={this.toggle.bind(this)}>
        <i className={"check ion-android-checkbox-outline" + (this.state.isChecked?"":"-blank")}></i>&nbsp;
        <label>{this.props.label}</label>
        </div>
      </div>
    )
  }
}
