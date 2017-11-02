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
    this.getUser();

    if (localStorage.getItem("_freecodecamp_text") != null) {
      var text = localStorage.getItem("_freecodecamp_text");
      this.setState({text: text});
      this.searchBars(text);
    }
    
  }
  
  isLoggedIn = () => {
    return (this.state.user && this.state.user.twitter);
  }
  
  getUser = () => {
    fetch('/user', {credentials: 'include'})
      .then((res) => {
        if (!res.redirected) {
          return res.json(); 
        }
      }).then((data) => {
        this.setState({user: data});
        console.log("userId: " + data._id);
      })
  }

  willGoWontGo = (id, going) => {
    if (!this.isLoggedIn()) {
      window.location.replace('/auth/twitter');
      return;
    }
    var check = going.findIndex((id) => {return id == this.state.user._id});
    let method;
    if (check == -1) {
      method = "PUT";
    }
    else {
      method = "DELETE";
    }
    fetch('/api/bars/' + id, {
      method: method,
      credentials: 'include'
    })
    .then((response) => {
      if (response.status == 200) {
        this.searchBars(this.state.text);
      }
    });
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
    localStorage.setItem("_freecodecamp_text", this.state.text);
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
          <Button onClick={() => { this.willGoWontGo(item.id, item.going) }}>{item.going ? item.going.length : 0} Going</Button>
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
