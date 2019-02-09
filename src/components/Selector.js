import React, { Component } from 'react';

class Selector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      option_items: []
    }
  }

  componentDidMount() {
    this.renderOptions();
  }

  renderOptions = () => {
    var option_items = this.state.option_items;

    // default item
    option_items.push(          
      <option value="default">select {this.props.type} ...</option>
    );

    this.props.options.forEach(option => {
      option_items.push(<option value={option}>{option}</option>)
    });
    this.setState({ option_items });
  }

  render() {
    var { type, options, filterImages, value } = this.props;
    return (
      <div className="exifSelector">
        <strong>{type}</strong><br />
        <select id="makeSelector" onChange={e => filterImages(e, type)} value={value}>
          {this.state.option_items}
        </select>
      </div>
    )
  }
}

export default Selector;