import React from 'react';
import styled from '@emotion/styled';
import {InjectedRouter} from 'react-router/lib/Router';

import {Panel, PanelBody} from 'app/components/panels';
import {t} from 'app/locale';
import ErrorBoundary from 'app/components/errorBoundary';
import LoadingMask from 'app/components/loadingMask';
import space from 'app/styles/space';
import withGlobalSelection from 'app/utils/withGlobalSelection';
import withOrganization from 'app/utils/withOrganization';
import {Release, Widget, Organization, GlobalSelection} from 'app/types';

import DiscoverQuery from '../discoverQuery';
import ExploreWidget from './exploreWidget';
import WidgetChart from './widgetChart';

type Props = {
  releasesLoading: boolean;
  releases: Array<Release>;
  widget: Widget;
  organization: Organization;
  selection: GlobalSelection;
  router: InjectedRouter;
};

function Widgets({
  organization,
  releasesLoading,
  router,
  widget,
  releases,
  selection,
}: Props) {
  const {title, includePreviousPeriod, compareToPeriod} = widget;

  return (
    <ErrorBoundary customComponent={<ErrorCard>{t('Error loading widget')}</ErrorCard>}>
      <DiscoverQuery
        releasesLoading={releasesLoading}
        releases={releases}
        organization={organization}
        selection={selection}
        queries={widget.queries.discover}
        includePreviousPeriod={includePreviousPeriod}
        compareToPeriod={compareToPeriod}
      >
        {({queries, results, reloading}) => {
          // Show a placeholder "square" during initial load
          if (results === null) {
            return <Placeholder />;
          }

          return (
            <WidgetWrapperForMask>
              {reloading && <ReloadingMask />}
              <StyledPanel>
                <WidgetHeader>{title}</WidgetHeader>
                <StyledPanelBody>
                  <WidgetChart
                    releases={releases}
                    selection={selection}
                    results={results}
                    widget={widget}
                    reloading={reloading}
                    router={router}
                    organization={organization}
                  />
                </StyledPanelBody>
                <WidgetFooter>
                  <div />
                  <ExploreWidget
                    widget={widget}
                    queries={queries}
                    router={router}
                    selection={selection}
                  />
                </WidgetFooter>
              </StyledPanel>
            </WidgetWrapperForMask>
          );
        }}
      </DiscoverQuery>
    </ErrorBoundary>
  );
}

export default withOrganization(withGlobalSelection(Widgets));
export {Widgets};

const StyledPanel = styled(Panel)`
  margin-bottom: ${space(2)};
`;

const StyledPanelBody = styled(PanelBody)`
  height: 200px;
`;

const Placeholder = styled('div')`
  background-color: ${p => p.theme.backgroundSecondary};
  height: 237px;
`;

const WidgetWrapperForMask = styled('div')`
  position: relative;
`;

const ReloadingMask = styled(LoadingMask)`
  z-index: 1;
  opacity: 0.6;
`;

const ErrorCard = styled(Placeholder)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${p => p.theme.alert.error.backgroundLight};
  border: 1px solid ${p => p.theme.alert.error.border};
  color: ${p => p.theme.alert.error.textLight};
  border-radius: ${p => p.theme.borderRadius};
  margin-bottom: ${space(2)};
`;

const WidgetHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${space(1)} ${space(2)};
`;

const WidgetFooter = styled(WidgetHeader)`
  border-top: 1px solid ${p => p.theme.border};
  padding: 0;
`;
