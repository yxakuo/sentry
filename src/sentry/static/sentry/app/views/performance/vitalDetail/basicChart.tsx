import React from 'react';
import {Location} from 'history';
import * as ReactRouter from 'react-router';

import {Organization} from 'app/types';
import {Client} from 'app/api';
import ReleaseSeries from 'app/components/charts/releaseSeries';
import {getInterval} from 'app/components/charts/utils';
import LoadingPanel from 'app/components/charts/loadingPanel';
import QuestionTooltip from 'app/components/questionTooltip';
import getDynamicText from 'app/utils/getDynamicText';
import {getParams} from 'app/components/organizations/globalSelectionHeader/getParams';
import {Panel} from 'app/components/panels';
import EventView from 'app/utils/discover/eventView';
import EventsRequest from 'app/components/charts/eventsRequest';
import {getUtcToLocalDateObject} from 'app/utils/dates';
import {axisLabelFormatter, tooltipFormatter} from 'app/utils/discover/charts';
import {IconWarning} from 'app/icons';

import {getAxisOptions} from '../data';
import {HeaderContainer, HeaderTitle, ErrorPanel} from '../styles';
import Chart from '../charts/chart';
import LineChart from 'app/components/charts/lineChart';
import ChartZoom from 'app/components/charts/chartZoom';

type Props = {
  api: Client;
  eventView: EventView;
  organization: Organization;
  location: Location;
  router: ReactRouter.InjectedRouter;
  keyTransactions: boolean;
};

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

    return (
      <Panel>
        <EventsRequest
          organization={organization}
          api={api}
          period={globalSelection.datetime.period}
          project={globalSelection.projects}
          environment={globalSelection.environments}
          start={start}
          end={end}
          interval={getInterval(
            {
              start: start || null,
              end: end || null,
              period: globalSelection.datetime.period,
            },
            true
          )}
          showLoading={false}
          query={eventView.getEventsAPIPayload(location).query}
          includePrevious={false}
          yAxis={axisOptions.map(opt => opt.value)}
          keyTransactions={keyTransactions}
        >
              {
                ({loading, reloading, errored, results}) => {
                  if (errored) {
                    return (
                      <ErrorPanel>
                        <IconWarning color="gray500" size="lg" />
                      </ErrorPanel>
                    );
                  }

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
                    <React.Fragment>

          <ChartZoom
            router={router}
            period={statsPeriod}
            projects={project}
            environments={environment}
          >
            {zoomRenderProps => {
                <React.Fragment>

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

                    <React.Fragment>

                      <HeaderContainer>
                        <HeaderTitle>
                          <span>Total Passing FID (p75)</span>
                          <QuestionTooltip
                            position="top"
                            size="sm"
                            title={'Total Passing first input delay'}
                          />
                        </HeaderTitle>
                      </HeaderContainer>
                      {results ? (
                        getDynamicText({
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
                          fixed: 'apdex and throughput charts',
                        })
                      ) : (
                        <LoadingPanel data-test-id="events-request-loading" />
                      )}
                    </React.Fragment>
                )}
                </ReleaseSeries>
                    </React.Fragment>

            }}
          </ChartZoom>
                  );
                };
              }
        </EventsRequest>
      </Panel>
    );
  }
}

export default withApi(Container);
