import Inferno from 'inferno'
import Component from 'inferno-component'
import classNames from 'classnames'

export default class Selector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: props.value
    }
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value && newProps.value != this.state.selected) {
      this.setState({selected: newProps.value})
    }
  }

  setValue (value) {
    let newState = {
      selected: value
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  fireChangeEvent (newState) {
    if (newState.selected !== this.state.selected && this.props.onChange) {
      this.props.onChange(this.getOption(newState.selected))
    }
  }

  renderOption (option) {
    const baseClassName = this.props.baseClassName || 'selector'
    let optionClass = classNames({
      [`${baseClassName}-option`]: true,
      'is-selected': option.value == this.state.selected
    })

    let value = option.value

    return (
      <div
        key={value}
        className={optionClass}
        onClick={this.setValue.bind(this, value)}>
        {option.label}
      </div>
    )
  }

  getOption (k) {
    if (!this.options_index) {
      this.options_index = {}
      for (var v in this.props.options) {
        this.options_index[this.props.options[v].value] = this.props.options[v];
      }
    }
    return this.options_index[k]
  }

  render () {

    return (
      <div className={this.props.className} >
        {this.props.options.map((x) => this.renderOption(x))}
      </div>
    )
  }
}
