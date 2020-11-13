import React from 'react';
import {Params} from 'react-router/lib/Router';
import {browserHistory, InjectedRouter} from 'react-router';
import {Location} from 'history';
import styled from '@emotion/styled';
import isEqual from 'lodash/isEqual';

import {Client} from 'app/api';
import {t} from 'app/locale';
import {loadOrganizationTags} from 'app/actionCreators/tags';
import {Organization, Project, GlobalSelection} from 'app/types';
import SentryDocumentTitle from 'app/components/sentryDocumentTitle';
import GlobalSelectionHeader from 'app/components/organizations/globalSelectionHeader';
import {PageContent} from 'app/styles/organization';
import EventView from 'app/utils/discover/eventView';
import {
  Column,
  WebVital,
  getAggregateAlias,
  isAggregateField,
} from 'app/utils/discover/fields';
import {decodeScalar} from 'app/utils/queryString';
import {tokenizeSearch, stringifyQueryObject} from 'app/utils/tokenizeSearch';
import LightWeightNoProjectMessage from 'app/components/lightWeightNoProjectMessage';
import withApi from 'app/utils/withApi';
import withGlobalSelection from 'app/utils/withGlobalSelection';
import withOrganization from 'app/utils/withOrganization';
import withProjects from 'app/utils/withProjects';

import {addRoutePerformanceContext, getTransactionName} from '../utils';
import {
  PERCENTILE as VITAL_PERCENTILE,
  VITAL_GROUPS,
} from '../transactionVitals/constants';
import VitalDetailContent from './vitalDetailContent';
import {generatePerformanceVitalDetailView} from '../data';

type Props = {
  api: Client;
  location: Location;
  params: Params;
  organization: Organization;
  projects: Project[];
  selection: GlobalSelection;
  loadingProjects: boolean;
  router: InjectedRouter;
};

type State = {
  eventView: EventView | undefined;
};

// Used to cast the totals request to numbers
// as React.ReactText
type TotalValues = Record<string, number>;

class VitalDetail extends React.Component<Props, State> {
  state: State = {
    eventView: generatePerformanceVitalDetailView(
      this.props.organization,
      this.props.location
    ),
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
    return {
      ...prevState,
      eventView: generatePerformanceVitalDetailView(
        nextProps.organization,
        nextProps.location
      ),
    };
  }

  componentDidMount() {
    const {api, organization, selection} = this.props;
    loadOrganizationTags(api, organization.slug, selection);
    addRoutePerformanceContext(selection);
  }

  componentDidUpdate(prevProps: Props) {
    const {api, organization, selection} = this.props;

    if (
      !isEqual(prevProps.selection.projects, selection.projects) ||
      !isEqual(prevProps.selection.datetime, selection.datetime)
    ) {
      loadOrganizationTags(api, organization.slug, selection);
      addRoutePerformanceContext(selection);
    }
  }

  getDocumentTitle(): string {
    const name = getTransactionName(this.props.location);

    const hasTransactionName = typeof name === 'string' && String(name).trim().length > 0;

    if (hasTransactionName) {
      return [String(name).trim(), t('Performance')].join(' - ');
    }

    return [t('Summary'), t('Performance')].join(' - ');
  }

  getTotalsEventView(
    organization: Organization,
    eventView: EventView
  ): [EventView, TotalValues] {
    const threshold = organization.apdexThreshold.toString();

    const vitals = organization.features.includes('measurements')
      ? VITAL_GROUPS.map(({vitals: vs}) => vs).reduce((keys: WebVital[], vs) => {
          vs.forEach(vital => keys.push(vital));
          return keys;
        }, [])
      : [];

    const totalsView = eventView.withColumns([
      {
        kind: 'function',
        function: ['apdex', threshold, undefined],
      },
      {
        kind: 'function',
        function: ['user_misery', threshold, undefined],
      },
      {
        kind: 'function',
        function: ['p95', '', undefined],
      },
      {
        kind: 'function',
        function: ['count', '', undefined],
      },
      {
        kind: 'function',
        function: ['count_unique', 'user', undefined],
      },
      ...vitals.map(
        vital =>
          ({
            kind: 'function',
            function: ['percentile', vital, VITAL_PERCENTILE.toString()],
          } as Column)
      ),
    ]);
    const emptyValues = totalsView.fields.reduce((values, field) => {
      values[getAggregateAlias(field.field)] = 0;
      return values;
    }, {});
    return [totalsView, emptyValues];
  }

  render() {
    const {organization, location, router} = this.props;
    const {eventView} = this.state;
    const transactionName = getTransactionName(location);
    if (!eventView) {
      // If there is no transaction name, redirect to the Performance landing page

      browserHistory.replace({
        pathname: `/organizations/${organization.slug}/performance/`,
        query: {
          ...location.query,
        },
      });
      return null;
    }

    const vitalNameQuery = decodeScalar(location.query.vitalName);
    const vitalName =
      Object.values(WebVital).indexOf(vitalNameQuery as WebVital) === -1
        ? undefined
        : (vitalNameQuery as WebVital);

    return (
      <SentryDocumentTitle title={this.getDocumentTitle()} objSlug={organization.slug}>
        <GlobalSelectionHeader>
          <StyledPageContent>
            <LightWeightNoProjectMessage organization={organization}>
              <VitalDetailContent
                location={location}
                organization={organization}
                eventView={eventView}
                router={router}
                vitalName={vitalName || WebVital.FID}
              />
            </LightWeightNoProjectMessage>
          </StyledPageContent>
        </GlobalSelectionHeader>
      </SentryDocumentTitle>
    );
  }
}

const StyledPageContent = styled(PageContent)`
  padding: 0;
`;

export default withApi(withGlobalSelection(withProjects(withOrganization(VitalDetail))));
