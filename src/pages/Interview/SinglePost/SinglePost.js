import React, { Component, Fragment } from 'react';
import MyButton from '../../../components/Button/Button';
import {ListItem, ListItemAction, ListItemContent, List, Icon, Card,  CardTitle, CardText ,CardActions, Button, CardMenu, IconButton} from 'react-mdl'
import UnitEdit from '../../../components/UnitEdit/UnitEdit';
import ErrorHandler from '../../../components/ErrorHandler/ErrorHandler';
import Loader from '../../../components/Loader/Loader';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    postId: '',
    units: [],
    isEditing: false,
    editLoading: false,
    error: '',
    unitsLoading: false,
    editUnit: null
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/interview/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          postId: resData.post._id,
          title: resData.post.title,
          author: resData.post.creator.name,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
          content: resData.post.content,
          units: resData.post.units
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  newUnitHandler = () => {
    this.setState({ isEditing: true });
  };
  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
   };
   errorHandler = () => {
    this.setState({ error: null });
  };

   finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    const formData = {...postData}
    let url = `http://localhost:8080/interview/post/${this.state.postId}/unit`;
    let method = 'POST';
    if (this.state.editUnit) {
      url = 'http://localhost:8080/interview/post/' + this.state.postId + '/unit/' + this.state.editUnit._id;
      method = 'PUT';
    }
    fetch(url, {
      method: method,
      body: JSON.stringify({
        content: formData.content
      }),
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Creating  a unit failed!');
        }
        return res.json();
      })
      .then(({unit}) => {
        this.setState(prevState => {
          let updatedUnits = [...prevState.units];
          if (prevState.editUnit) {
            const unitIndex = prevState.units.findIndex(
              u => u._id === prevState.editUnit._id
            );
            updatedUnits[unitIndex] = unit;
          }
          updatedUnits = prevState.units.concat(unit);
          return {
            units: updatedUnits.reverse(),
            isEditing: false,
            editUnit: null,
            editLoading: false
          };
        })
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error:{message: "You are not authorized to delete this Interview" }
        });
      });
  };

  deleteUnitHandler = unitId => {
    this.setState({ unitsLoading: true });
    fetch('http://localhost:8080/interview/post/' + this.state.postId + '/unit/' + unitId , {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a this unit failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState(prevState => {
          const updatedUnits = prevState.units.filter(u => u._id !== unitId);
          return { units: updatedUnits, unitsLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ unitsLoading: false, error:{message: "You are not authorized to delete this unit" } });
      });
  };

  startEditUnitHandler = (unitId) => {
    this.setState(prevState => {
      const loadedUnits = { ...prevState.units.find(u => u._id === unitId) };

      return {
        isEditing: true,
        editUnit: loadedUnits
      };
    });
  }
  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
          <UnitEdit
           editing={this.state.isEditing}
           selectedUnit={this.state.editUnit}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
      <section className="single-post">
      {this.state.unitsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
      <Card shadow={0} style={{width: '100%'}}>
      <CardTitle style={{color: '#fff', height: '300px', background: `url(${this.state.image}) center / cover`}}>{this.state.title}</CardTitle>
      <CardText>
      {this.state.content}
      </CardText>
      <CardActions border>
        Created by {this.state.author} on {this.state.date}
      </CardActions>
      <CardMenu style={{color: '#fff'}}>
        <IconButton name="share" />
      </CardMenu>
     </Card>
        <div className="units-container d-flex flex-column">
        <h3>Units</h3>
        <section className="feed__control">
          <MyButton mode="raised" design="accent" onClick={this.newUnitHandler}>
            New Unit
          </MyButton>
        </section>
        {this.state.units && this.state.units.length > 0 ? (
        <List >
        {this.state.units.map((unit, key) => (
          <div className="unit" key={key}>  
        <ListItem threeLine >
        <ListItemContent avatar="comment" subtitle={unit.content}>Created by {unit.creator.name} on {new Date(unit.createdAt).toLocaleDateString('en-US')}</ListItemContent>
       <ListItemAction>
        <Icon name="edit" onClick={() => this.startEditUnitHandler(unit._id)} theme="outlined"  style={{ fontSize: "20px", color: "green" }}/>
        <Icon name="delete" onClick={() => this.deleteUnitHandler(unit._id)} theme="outlined" style={{ fontSize: "20px", color: "#CC160B" }}/>
       </ListItemAction>
       </ListItem>
   
        </div>
          ))}
         </List>
        
        ) :  <p style={{ textAlign: 'center' }}>No Units found.</p>}
        
        </div>
      </section>
      </Fragment>
    );
  }
}

export default SinglePost;
