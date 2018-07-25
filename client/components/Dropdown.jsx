/* forked from https://github.com/nightwolfz/inferno-dropdown/ */
import Inferno from 'inferno'
import Component from 'inferno-component'
import classNames from 'classnames'

export default class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: props.value,
      isOpen: false
    }
    this.mounted = true
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.value && newProps.value != this.state.selected) {
      this.setState({selected: newProps.value})
    } else if (!newProps.value && newProps.placeholder) {
      this.setState({selected: { label: newProps.placeholder, value: '' }})
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
    document.addEventListener('touchend', this.handleDocumentClick, false)
  }

  componentWillUnmount () {
    this.mounted = false
    document.removeEventListener('click', this.handleDocumentClick, false)
    document.removeEventListener('touchend', this.handleDocumentClick, false)
  }

  handleMouseDown (event) {
    if (event.type === 'mousedown' && event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  setValue (value) {
    console.log("setValue", value)
    let newState = {
      selected: value,
      isOpen: false
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
    const baseClassName = this.props.baseClassName || 'dropdown'
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

  buildMenu () {
    const baseClassName = this.props.baseClassName || 'dropdown'
    let { options } = this.props
    let ops = options.map((option) => {
      if (option.type === 'group') {
        let groupTitle = (<div className={`${baseClassName}-title`}>{option.name}</div>)
        let _options = option.items.map((item) => this.renderOption(item))

        return (
          <div className={`${baseClassName}-group`} key={option.name}>
            {groupTitle}
            {_options}
          </div>
        )
      } else {
        return this.renderOption(option)
      }
    })

    return ops.length ? ops : <div className={`${baseClassName}-noresults`}>No options found</div>
  }

  handleDocumentClick (event) {
    if (this.mounted) {
      if (!this.myref.contains(event.target)) {
        this.setState({ isOpen: false })
      }
    }
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
    const baseClassName = this.props.baseClassName || 'dropdown'
    const placeHolderValue = this.getOption(this.state.selected).label
    let value = (<div className={`${baseClassName}-placeholder`}>{placeHolderValue}</div>)
    let menu = this.state.isOpen ? <div className={`${baseClassName}-menu`}>{this.buildMenu()}</div> : null

    let dropdownClass = classNames({
      [`${baseClassName}-root`]: true,
      'is-open': this.state.isOpen
    })

    return (
      <div className={dropdownClass}  ref={el => this.myref = el} >
        <div className={`${baseClassName}-control`} onClick={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)}>
          {value}
          <span className={`${baseClassName}-arrow`} />
        </div>
        {menu}
      </div>
    )
  }
}
