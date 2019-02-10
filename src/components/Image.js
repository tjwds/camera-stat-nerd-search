import React, { Component } from 'react';

class Image extends Component {
  render() {
    var { image } = this.props;
    return (
      <div 
        className="imageWrapper"
      >
        <div className="float">
          <a href={image.links.html}><img 
            className="image image-fullsize" 
            src={image.urls.small} 
            alt={image.description} 
          /></a>
        </div>
        <div className="float">
          <pre><strong>{image.user.name}</strong></pre>
          <pre>aperture:       {image.exif.aperture}</pre>
          <pre>exposure time:  {image.exif.exposure_time}</pre>
          <pre>focal length:   {image.exif.focal_length}</pre>
          <pre>iso:            {image.exif.iso}</pre>
          <pre>make:           {image.exif.make}</pre>
          <pre>model:          {image.exif.model}</pre>
        </div>
      </div>
    )
  }
}

export default Image;