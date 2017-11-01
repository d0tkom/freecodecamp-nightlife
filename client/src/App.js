import React, { Component } from 'react';
import './App.css';
import { Form, ListGroup, ListGroupItem, Navbar, Nav, NavItem, MenuItem, NavDropdown,
  FormGroup, ControlLabel, FormControl, HelpBlock, Button, Col, Row} from 'react-bootstrap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: false, isLoading: false, bars: [], text: ""};
  }

  componentDidMount() {
    //this.getPolls('/api/polls');
    //this.getUser();
  }
  
  isLoggedIn = () => {
    return (this.state.user && this.state.user.twitter);
  }
  
  getUser = () => {
    this.setState({isLoading: true});
    fetch('/user', {credentials: 'include'})
      .then((res) => {
        if (!res.redirected) {
          return res.json(); 
        }
        console.log('not logged in');
      }).then((data) => {
        console.log(data);
        this.setState({user: data, isLoading: false});
        console.log(data);
      })
  }
  
  getPolls = (str) => {
    this.setState({isLoading: true});
    fetch(str, {credentials: 'include'})
      .then((res) => {
        return res.json();
      }).then((data) => {
        this.setState({polls: data.polls, isLoading: false});
      })
  }

  submitPoll = (event) => {
    event.preventDefault();
    this.setState({isLoading: true});
    fetch('/api/polls', {
      headers: { 'content-type': 'application/json' },
      method: "post",
      body: JSON.stringify({poll: this.state.newPoll}),
      credentials: 'include'
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      this.getPolls('/api/polls');
      console.log(json);
      this.setState({poll: json.poll, isLoading: false});
      this.pollDataToChartData(json.poll);
      return json;
    })
    .then(
      response => response,
      error => error
    );
  }

  searchBars = (location) => {
    this.setState({isLoading: true});
    fetch('/api/search/' + location, {credentials: 'include'})
      .then((res) => {
        return res.json();
      }).then((data) => {
        this.setState({bars: data.businesses, isLoading: false});
      })
  }

  submitForm = (event) => {
    event.preventDefault();
    this.searchBars(this.state.text);
  }

  handleChange = (event) => {
    this.setState({text: event.target.value});
  }

  render() {
    return (
      <div>
        <div className="App">
        <h1>Nightlife coordinator</h1>
        <Form inline onSubmit={this.submitForm}>
        <FormGroup
          controlId="formBasicText"
        >
          <FormControl
            type="text"
            value={this.state.text}
            placeholder="Enter a location"
            onChange={this.handleChange}
          />
          <Button type="submit">Submit</Button>
        </FormGroup>
      </Form>
      </div>
      <div style={{margin: 20}}>
      {this.state.bars.map((item, i) => {
        return <div>
          {item.name}
          {" "}
          <Button>{item.going ? item.going.length : "err"} Going</Button>
        </div>
      })}
      </div>
      </div>
    );
  }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export default App;
