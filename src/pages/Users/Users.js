import React, { Component, Fragment } from 'react';
import {ListItem, ListItemAction, ListItemContent, List, Icon} from 'react-mdl'
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import Loader from '../../components/Loader/Loader';
import './Users.css';

class ListUsers extends Component {
  state = {
    users: [],
    isEditing: false,
    error: '',
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/user/users/',{
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch users');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          users: resData.users
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  
  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
          
      <section className="list-users">
      {this.state.usersLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
     
        <div className="users-container d-flex flex-column">
        <h3>Researchers</h3>
        {this.state.users && this.state.users.length > 0 ? (
        <List >
        {this.state.users.map((user, key) => (
          <div className="user" key={key}>  
        <ListItem twoLine>
        <ListItemContent avatar="person" subtitle={user.email}>{user.name}</ListItemContent>
            <ListItemAction>
            <a href="#"><Icon name="star" /></a>
            </ListItemAction>
            </ListItem>
        </div>
          ))}
         </List>
        
        ) :  <p style={{ textAlign: 'center' }}>No Users found.</p>}
        
        </div>
      </section>
      </Fragment>
    );
  }
}

export default ListUsers;
