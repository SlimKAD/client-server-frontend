import React, { Component, Fragment } from 'react';

import Backdrop from '../Backdrop/Backdrop';
import Modal from '../Modal/Modal';
import Input from '../Form/Input/Input';
import { required, length } from '../../util/validators';

const UNIT_FORM = {
  content: {
    value: '',
    valid: false,
    touched: false,
    validators: [required, length({ min: 5 })]
  }
};

class UnitEdit extends Component {
  state = {
    unitForm: UNIT_FORM,
    formIsValid: false
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.editing &&
      prevProps.editing !== this.props.editing &&
      prevProps.selectedUnit !== this.props.selectedUnit
    ) {
      const unitForm = {
        content: {
          ...prevState.unitForm.content,
          value: this.props.selectedUnit.content,
          valid: true
        }
      };
      this.setState({ unitForm: unitForm, formIsValid: true });
    }
  }

  
  unitInputChangeHandler = (input, value) => {
   
    this.setState(prevState => {
      let isValid = true;
      for (const validator of prevState.unitForm[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.unitForm,
        [input]: {
          ...prevState.unitForm[input],
          valid: isValid,
          value: value
        }
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        unitForm: updatedForm,
        formIsValid: formIsValid
      };
    });
  };

  inputBlurHandler = input => {
    this.setState(prevState => {
      return {
        unitForm: {
          ...prevState.unitForm,
          [input]: {
            ...prevState.unitForm[input],
            touched: true
          }
        }
      };
    });
  };

  cancelUnitChangeHandler = () => {
    this.setState({
      unitForm: UNIT_FORM,
      formIsValid: false
    });
    this.props.onCancelEdit();
  };

  acceptUnitChangeHandler = () => {
    const post = {
      content: this.state.unitForm.content.value
    };
    this.props.onFinishEdit(post);
    this.setState({
      unitForm: UNIT_FORM,
      formIsValid: false
    });
  };

  render() {
    return this.props.editing ? (
      <Fragment>
        <Backdrop onClick={this.cancelUnitChangeHandler} />
        <Modal
          title={this.props.editing? "Edit Unit":"New Unit"}
          acceptEnabled={this.state.formIsValid}
          onCancelModal={this.cancelUnitChangeHandler}
          onAcceptModal={this.acceptUnitChangeHandler}
          isLoading={this.props.loading}
        >
          <form>
            <Input
              id="content"
              label="Content*"
              control="textarea"
              rows="5"
              onChange={this.unitInputChangeHandler}
              onBlur={this.inputBlurHandler.bind(this, 'content')}
              valid={this.state.unitForm['content'].valid}
              touched={this.state.unitForm['content'].touched}
              value={this.state.unitForm['content'].value}
            />
          </form>
        </Modal>
      </Fragment>
    ) : null;
  }
}

export default UnitEdit;
