import React from 'react';
import {withRouter} from 'react-router';
import {WithRouterProps} from 'react-router/lib/withRouter';

import TransparentLoadingMask from 'app/components/charts/transparentLoadingMask';
import TransitionChart from 'app/components/charts/transitionChart';
import ReleaseSeries from 'app/components/charts/releaseSeries';
import getDynamicText from 'app/utils/getDynamicText';
import {getUtcToLocalDateObject} from 'app/utils/dates';
import {decodeScalar} from 'app/utils/queryString';
import withApi from 'app/utils/withApi';
import {Client} from 'app/api';
import EventView from 'app/utils/discover/eventView';
import {OrganizationSummary, EventsStatsData, Project} from 'app/types';
import LineChart from 'app/components/charts/lineChart';
import ChartZoom from 'app/components/charts/chartZoom';
import {Series} from 'app/types/echarts';
import theme from 'app/utils/theme';
import {axisLabelFormatter, tooltipFormatter} from 'app/utils/discover/charts';

import {TrendChangeType, TrendsStats, NormalizedTrendsTransaction} from './types';

const QUERY_KEYS = [
  'environment',
  'project',
  'query',
  'start',
  'end',
  'statsPeriod',
] as const;

type ViewProps = Pick<EventView, typeof QUERY_KEYS[number]>;

type Props = WithRouterProps &
  ViewProps & {
    api: Client;
    location: Location;
    organization: OrganizationSummary;
    transaction?: NormalizedTrendsTransaction;
    isLoading: boolean;
    statsData: TrendsStats;
    projects: Project[];
  };

function transformEventStats(data: EventsStatsData, seriesName?: string): Series[] {
  return [
    {
      seriesName: seriesName || 'Current',
      data: data.map(([timestamp, countsForTimestamp]) => ({
        name: timestamp * 1000,
        value: countsForTimestamp.reduce((acc, {count}) => acc + count, 0),
      })),
    },
  ];
}

class Chart extends React.Component<Props> {
  render() {
    const props = this.props;

    const {
      router,
      statsPeriod,
      project,
      environment,
      transaction,
      statsData,
      isLoading,
      projects,
    } = props;

    const events =
      statsData && transaction?.project && transaction?.transaction
        ? statsData[[transaction.project, transaction.transaction].join(',')]
        : undefined;
    const data = events?.data ?? [];

    const results = transformEventStats(data, 'FID (p75)');

    const start = props.start ? getUtcToLocalDateObject(props.start) : undefined;

    const end = props.end ? getUtcToLocalDateObject(props.end) : undefined;
    const utc = decodeScalar(router.location.query.utc);

    const loading = isLoading;
    const reloading = isLoading;

    const transactionProject = parseInt(
      projects.find(({slug}) => transaction?.project === slug)?.id || '',
      10
    );

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

    return (
      <React.Fragment>
        <ChartZoom
          router={router}
          period={statsPeriod}
          projects={project}
          environments={environment}
        >
          {zoomRenderProps => {
            const series = results
              ? results.map(values => {
                  return {
                    ...values,
                    color: theme.purple500,
                    lineStyle: {
                      opacity: 1,
                    },
                  };
                })
              : [];

            return (
              <ReleaseSeries
                start={start}
                end={end}
                period={statsPeriod}
                utc={utc}
                projects={isNaN(transactionProject) ? project : [transactionProject]}
                environments={environment}
                memoized
              >
                {({releaseSeries}) => (
                  <TransitionChart loading={loading} reloading={reloading}>
                    <TransparentLoadingMask visible={reloading} />
                    {getDynamicText({
                      value: (
                        <LineChart
                          {...zoomRenderProps}
                          {...chartOptions}
                          series={[...series, ...releaseSeries]}
                          seriesOptions={{
                            showSymbol: false,
                          }}
                          toolBox={{
                            show: false,
                          }}
                          grid={{
                            left: '10px',
                            right: '10px',
                            top: '40px',
                            bottom: '0px',
                          }}
                        />
                      ),
                      fixed: 'Duration Chart',
                    })}
                  </TransitionChart>
                )}
              </ReleaseSeries>
            );
          }}
        </ChartZoom>
      </React.Fragment>
    );
  }
}

export default withApi(withRouter(Chart));
