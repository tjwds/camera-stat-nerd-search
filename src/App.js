/* Still TODO:

* refactor to separate components
* refactor filter logic — DRY
* Handle API limit
* Hide secret key — server pass-through

*/

import React, { Component } from 'react';
import './App.css';
import Unsplash from 'unsplash-js';
import UNSPLASH_API_KEYS from './keys.js';
import API_DATA from './api_data_mock';
import SEARCH_DATA from './search_data_mock';
import users from 'unsplash-js/lib/methods/users';
import Image from './components/Image';
import Selector from './components/Selector';

const unsplash = new Unsplash({
  applicationId: UNSPLASH_API_KEYS.KEY,
})
const TESTING = false;
const INTERVAL_LIMIT = 10;
const INTERVAL_SPEED = 1; // number in seconds

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      images: [],
      previous_images: [],
      selector_values: {
        make: "default",
        model: "",
        exposure_min: null,
        exposure_max: null,
        aperture_min: null,
        aperture_max: null,
        focal_length_min: null,
        focal_length_max: null,
        iso_min: null,
        iso_max: null,
      },
      search: "",
      ready: false,
      loading: false,
      search_interval: 0,
      currently_calling: false,
    };
  }

  filterImage = (image) => {
    //TODO:  refactor this so that it's ... better.

    let render_image = true;

    if (this.state.selector_values.make !== "default") {
      var exif = image.exif.make;
      if (exif) {
        exif = exif.toLowerCase();
        exif = exif.replace(/\W/g, '');

        if (exif !== this.state.selector_values.make) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    } 

    if (this.state.selector_values.model) {
      var exif = image.exif.model;
      if (exif) {
        exif = exif.toLowerCase();
        exif = exif.replace(/\W/g, '');
        var model_search = this.state.selector_values.model;
        model_search = model_search.toLowerCase();
        model_search = model_search.replace(/\W/g, '');
        if (!exif.includes(model_search)) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }

    if (this.state.selector_values.exposure_max) {
      var exif = image.exif.exposure_time;
      if (exif) {
        exif = Number(exif.substring(2))
        if (exif >= Number(this.state.selector_values.exposure_max)) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }
    if (this.state.selector_values.exposure_min) {
      var exif = image.exif.exposure_time;
      if (exif) {
        exif = Number(exif.substring(2))
        if (exif <= this.state.selector_values.exposure_min) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }

    if (this.state.selector_values.aperture_max) {
      var exif = image.exif.aperture;
      if (exif) {
        exif = Number(exif)
        if (exif >= Number(this.state.selector_values.aperture_max)) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }
    if (this.state.selector_values.aperture_min) {
      var exif = image.exif.aperture;
      if (exif) {
        exif = Number(exif)
        if (exif <= this.state.selector_values.aperture_min) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }

    if (this.state.selector_values.focal_length_max) {
      var exif = image.exif.focal_length;
      if (exif) {
        exif = Number(exif)
        if (exif >= Number(this.state.selector_values.focal_length_max)) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }
    if (this.state.selector_values.focal_length_min) {
      var exif = image.exif.focal_length;
      if (exif) {
        exif = Number(exif)
        if (exif <= this.state.selector_values.focal_length_min) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }

    if (this.state.selector_values.iso_max) {
      var exif = image.exif.iso;
      if (exif) {
        exif = Number(exif)
        if (exif >= Number(this.state.selector_values.iso_max)) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }
    if (this.state.selector_values.iso_min) {
      var exif = image.exif.iso;
      if (exif) {
        exif = Number(exif)
        if (exif <= this.state.selector_values.iso_min) {
          render_image = false;
        }
      } else {
        render_image = false;
      }
    }

    // now add the image
    if (render_image) {
      this.renderImage(image);
    }
  }

  getAnImageAndProcess = (photo) => {
    this.setState({currently_calling: true}, () => {
      unsplash.photos.getPhoto(photo.id)
      .then(response => response.json())
      .then(body => {
        var search_interval = this.state.search_interval + 1;
        // potentially filter
        this.filterImage(body);
        this.setState({ search_interval, currently_calling: false })
      })
    })
  }

  searchInterval = (data) => {
    if (this.state.search_interval < INTERVAL_LIMIT) {
      if (!this.state.currently_calling) {
        this.getAnImageAndProcess(data[this.state.search_interval]);
      }
    } else {
      this.setState({ loading: false, ready: true });
      // honestly?  It's okay if we never clear this interval.  
    }
  }

  getTargetPhotosAndAddImage = () => {
    if (TESTING) {
      API_DATA.forEach(body => {
        this.renderImage(body);
      })
      this.setState({ ready: true });
    } else {
      var unsplash_query = () => {
        if (this.state.search) {
          return unsplash.search.photos(this.state.search, 1, 50)
        } else {
          return unsplash.photos.listPhotos(1, 50, "latest")
        }
      }

      unsplash_query()
      .then(response => response.json())
      .then(body => {
        var search_results = body;
        if (body.results) {
          search_results = body.results;
        }
        // this is surprisingly complicated.  Set an interval that will PROCEDURALLY set state and check if the unsplash call is finished before making another call.
        this.setState({loading: true});
        var apiInterval = window.setInterval(() => {this.searchInterval(search_results)}, INTERVAL_SPEED * 1000);
      })
    }
  }

  renderImage = image => {
    var results = this.state.images;
    
    results.push(
      <Image image={image} />
    )

    this.setState({ images: results, previous_images: results });
  }

  updateFilter = (event, type) => {
    // manage state
    var selector_values = this.state.selector_values;
    selector_values[type] = event.target.value;
    this.setState({ selector_values });
  }

  // this name is a hold over from when it used to actually filter
  renderSearch = event => {
    this.setState({ search: event.target.value });
  }

  doSearch = () => {
    this.getTargetPhotosAndAddImage();
  }

  render() {
    return (
      <div className="App">
      {!this.state.loading &&
      <React.Fragment>
      { !this.state.ready &&
      <React.Fragment>
        <h1 className="flex-line">Camera Stat Nerd Search</h1>
        <p className="flex-line">Search Unsplash for specific camera stats</p>

          <input 
            type="text" 
            className="search" 
            placeholder="Search - or leave blank to view the new feed..." 
            value={this.state.search}
            onChange={e => this.renderSearch(e)}
          ></input><br />

        <div className="flex-line">
          <Selector 
            type="make" 
            options={["apple", "canon", "fujifilm", "nikon", "olympus", "sony"]} 
            filterImages={this.updateFilter} 
            value={this.state.selector_values.make} 
          />

          <div className="exifSelector">
            <strong>model</strong><br />
            <input type="text" placeholder="model" onChange={e => this.updateFilter(e, "model")}></input>
          </div>

        </div>
        <div className="flex-line">
          <div className="exifSelector">
            <strong>exposure</strong><br />
            1/<input type="number" placeholder="200" onChange={e => this.updateFilter(e, "exposure_min")} step="0.1"></input> to 1/<input type="number" placeholder="200" onChange={e => this.updateFilter(e, "exposure_max")} step="0.1"></input>
          </div>
        
          <div className="exifSelector">
            <strong>aperture</strong><br />
            f/<input type="number" placeholder="8" onChange={e => this.updateFilter(e, "aperture_min")} step="0.1"></input> to f/<input type="number" placeholder="8" onChange={e => this.updateFilter(e, "aperture_max")} step="0.1"></input>
          </div>
        </div>

        <div className="flex-line">
          <div className="exifSelector">
            <strong>focal length</strong><br />
            <input type="number" placeholder="35" onChange={e => this.updateFilter(e, "focal_length_min")} step="0.1"></input>mm to <input type="number" placeholder="35" onChange={e => this.updateFilter(e, "focal_length_max")} step="0.1"></input>mm
          </div>

          <div className="exifSelector">
            <strong>iso</strong><br />
            <input type="number" placeholder="200" onChange={e => this.updateFilter(e, "iso_min")} step="100"></input> to <input type="number" placeholder="200" onChange={e => this.updateFilter(e, "iso_max")} step="100"></input>
          </div>
        </div>

        <p>Please click once and be patient.  This app makes too many calls to the Unsplash API and has some pretty severe throttling built in to make sure that multiple people can use it at once.  The more specific your query, the more likely it is that you won't see any results.</p>
        <button onClick={ () => this.doSearch() }>go</button>
      </React.Fragment>
      }

        { this.state.ready && 
        <React.Fragment>
          <p className="flex-line"><button onClick={() => window.location.reload()}>go back</button></p>
          {this.state.images.length === 0 &&
            <p>Sorry, we didn't find any images that match your search this time.  Maybe try to be a little less specific?</p>
          }
        <div>
          {this.state.images}
        </div>  
        </React.Fragment>
      }
        </React.Fragment>
      }
      { this.state.loading && 
        <React.Fragment>
          <p className="flex-line">Found {this.state.images.length} images so far...</p>
          <p className="flex-line">About {Number(((INTERVAL_LIMIT - this.state.search_interval) * INTERVAL_SPEED) + INTERVAL_SPEED)} seconds remaining...</p>
          <p className="flex-line"><button onClick={ () => {this.setState({ search_interval: Infinity, loading: false, ready: true }) }}>Or just view what we've found...</button></p>
        </React.Fragment>
      }
      </div>
    );
  }
}

export default App;
