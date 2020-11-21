import {RouteComponentProps} from 'react-router/lib/Router';
import React from 'react';
import styled from '@emotion/styled';

import {Organization, Project} from 'app/types';
import {PageContent, PageHeader} from 'app/styles/organization';
import {t} from 'app/locale';
import space from 'app/styles/space';
import AsyncView from 'app/views/asyncView';
import BuilderBreadCrumbs from 'app/views/alerts/builder/builderBreadCrumbs';
import IncidentRulesDetails from 'app/views/settings/incidentRules/details';
import IssueEditor from 'app/views/settings/projectAlerts/issueEditor';
import withApi from 'app/utils/withApi';
import PageHeading from 'app/components/pageHeading';
import SentryDocumentTitle from 'app/components/sentryDocumentTitle';
import {Client} from 'app/api';

type RouteParams = {
  orgId: string;
  projectId: string;
  ruleId: string;
};

type Props = RouteComponentProps<RouteParams, {}> & {
  api: Client;
  organization: Organization;
  project: Project;
  hasMetricAlerts: boolean;
} & AsyncView['props'];

type State = {
  alertType: string;
} & AsyncView['state'];

class ProjectAlertsEditor extends AsyncView<Props, State> {
  getDefaultState(): State {
    return {
      ...super.getDefaultState(),
      alertType: '',
    };
  }

  getEndpoints(): ReturnType<AsyncView['getEndpoints']> {
    const {location, params, organization, project} = this.props;
    if (location.pathname.includes('/alerts/metric-rules/')) {
      return [
        ['endpoint', `/organizations/${organization.slug}/alert-rules/${params.ruleId}/`],
      ];
    } else {
      return [
        [
          'endpoint',
          `/projects/${organization.slug}/${project.slug}/rules/${params.ruleId}/`,
        ],
      ];
    }
  }

  render() {
    const {hasMetricAlerts, location, params, organization, project} = this.props;
    const name = this.state.remainingRequests === 0 ? this.state.endpoint.name : '';
    const {projectId} = params;
    const alertType = location.pathname.includes('/alerts/metric-rules/')
      ? 'metric'
      : 'issue';

    const title = t(`Edit Alert Rule: ${name}`);

    return (
      <React.Fragment>
        <SentryDocumentTitle title={title} objSlug={projectId} />
        <PageContent>
          <BuilderBreadCrumbs
            hasMetricAlerts={hasMetricAlerts}
            orgSlug={organization.slug}
            title={title}
          />
          <StyledPageHeader>
            <PageHeading>{title}</PageHeading>
          </StyledPageHeader>
          {(!hasMetricAlerts || alertType === 'issue') && (
            <IssueEditor {...this.props} project={project} />
          )}
          {hasMetricAlerts && alertType === 'metric' && (
            <IncidentRulesDetails {...this.props} project={project} />
          )}
        </PageContent>
      </React.Fragment>
    );
  }
}

const StyledPageHeader = styled(PageHeader)`
  margin-bottom: ${space(4)};
`;

export default withApi(ProjectAlertsEditor);
