import React from 'react';
import {Location} from 'history';
import * as ReactRouter from 'react-router';
import styled from '@emotion/styled';

import {Organization} from 'app/types';
import {Client} from 'app/api';
import withApi from 'app/utils/withApi';

import VitalChartDiscoverQuery from './vitalChartDiscoverQuery';
import Chart from './chart';

type Props = {
  api: Client;
  eventView: EventView;
  organization: Organization;
  location: Location;
  router: ReactRouter.InjectedRouter;
  keyTransactions: boolean;
};

function getChartTitle() {
  return 'Total Passing FID (p50)';
}

class Container extends React.Component<Props> {
  getChartParameters() {
    const {location, organization} = this.props;
    const options = getAxisOptions(organization);
    const left = options.find(opt => opt.value === location.query.left) || options[0];
    const right = options.find(opt => opt.value === location.query.right) || options[1];

    return [left, right];
  }

  render() {
    const {api, organization, location, eventView, router, keyTransactions} = this.props;

    // construct request parameters for fetching chart data
    const globalSelection = eventView.getGlobalSelection();
    const start = globalSelection.datetime.start
      ? getUtcToLocalDateObject(globalSelection.datetime.start)
      : undefined;

    const end = globalSelection.datetime.end
      ? getUtcToLocalDateObject(globalSelection.datetime.end)
      : undefined;

    const {utc} = getParams(location.query);
    const axisOptions = this.getChartParameters();

    const chartOptions = {
      tooltip: {
        valueFormatter: (value, seriesName) => {
          return tooltipFormatter(value, seriesName);
        },
      },
      yAxis: {
        axisLabel: {
          color: theme.gray400,
          // p50() coerces the axis to be time based
          formatter: (value: number) => axisLabelFormatter(value, 'p50()'),
        },
      },
    };

    const chartTitle = getChartTitle();

    return (
      <Panel>
        <VitalChartDiscoverQuery
          eventView={eventView}
          orgSlug={organization.slug}
          location={location}
          limit={5}
        >
          {({isLoading, tableData, pageLinks}) => {
            return (
              <Chart
                statsData={statsData}
                query={trendView.query}
                project={trendView.project}
                environment={trendView.environment}
                start={trendView.start}
                end={trendView.end}
                statsPeriod={trendView.statsPeriod}
                transaction={selectedTransaction}
                isLoading={isLoading}
                {...props}
              />
            );
          }}
        </VitalChartDiscoverQuery>
      </Panel>
    );
  }
}

const StyledHeaderTitleLegend = styled(HeaderTitleLegend)`
  padding: 0;
  margin: ${space(3)};
`;

export default withApi(Container);
