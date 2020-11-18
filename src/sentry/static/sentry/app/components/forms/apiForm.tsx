import PropTypes from 'prop-types';
import React from 'react';

import {APIRequestMethod, Client} from 'app/api';
import {
  addLoadingMessage,
  clearIndicators,
  addErrorMessage,
} from 'app/actionCreators/indicator';
import {t} from 'app/locale';
import Form from 'app/components/forms/form';
import FormField from 'app/components/forms/formField';
import FormState from 'app/components/forms/state';

type Props = Form['props'] & {
  onSubmit?: (data: object) => void;
  apiEndpoint: string;
  apiMethod: APIRequestMethod;
  submitLoadingMessage?: string;
  submitErrorMessage?: string;
};

export default class ApiForm extends Form<Props> {
  api = new Client();

  static propTypes = {
    ...Form.propTypes,
    getEnabledData: PropTypes.func,
    onSubmit: PropTypes.func,
    apiMethod: PropTypes.string.isRequired,
    apiEndpoint: PropTypes.string.isRequired,
    submitLoadingMessage: PropTypes.string,
    submitErrorMessage: PropTypes.string,
  };

  static defaultProps = {
    ...Form.defaultProps,
    submitErrorMessage: t('There was an error saving your changes.'),
    submitLoadingMessage: t('Saving changes\u2026'),
  };

  componentWillUnmount() {
    this.api.clear();
  }

  getEnabledData() {
    // Return a hash of data from non-disabled fields.

    // Start with this.state.data and remove rather than starting from scratch
    // and adding, because a) this.state.data is our source of truth, and b)
    // we'd have to do more work to loop over the state.data Object and lookup
    // against the props.children Array (looping over the Array and looking up
    // in the Object is more natural). Maybe the consequent use of delete
    // carries a slight performance hit. Why is yer form so big? 🤔

    const data = {...this.state.data}; // Copy to avoid mutating state.data itself.
    React.Children.forEach(this.props.children, (child: any) => {
      if (!FormField.isPrototypeOf(child.type)) {
        return; // Form children include h4's, etc.
      }
      if (child.key && child.props?.disabled) {
        delete data[child.key]; // Assume a link between child.key and data. 🐭
      }
    });
    return data;
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (this.state.state === FormState.SAVING) {
      return;
    }

    const data = this.getEnabledData();

    this.props.onSubmit && this.props.onSubmit(data);
    this.setState(
      {
        state: FormState.SAVING,
      },
      () => {
        addLoadingMessage(this.props.submitLoadingMessage);
        this.api.request(this.props.apiEndpoint, {
          method: this.props.apiMethod,
          data,
          success: result => {
            clearIndicators();
            this.onSubmitSuccess(result);
          },
          error: error => {
            addErrorMessage(this.props.submitErrorMessage);
            this.onSubmitError(error);
          },
        });
      }
    );
  };
}
