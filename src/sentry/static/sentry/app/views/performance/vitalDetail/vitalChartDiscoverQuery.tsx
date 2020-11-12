import React from 'react';

import withApi from 'app/utils/withApi';
import {MetaType} from 'app/utils/discover/eventView';
import GenericDiscoverQuery, {
  DiscoverQueryProps,
} from 'app/utils/discover/genericDiscoverQuery';

export type TableDataRow = {
  id: string;
  [key: string]: React.ReactText;
};
export type TableData = {
  data: Array<TableDataRow>;
  meta?: MetaType;
};

type Props = DiscoverQueryProps & {
  onlyVital?: string;
};

function getRequestPayload(props: Props) {
  const {eventView, onlyVital} = props;
  const apiPayload = eventView?.getEventsAPIPayload(props.location);
  let vitalFields = [
    'count_at_least(measurements.fid, 300)',
    'percentage(count_at_least_measurements_fid_300, count, fid_percentage)',
  ];
  if (onlyVital) {
    vitalFields = vitalFields.filter(field =>
      field.includes(onlyVital.replace('measurements.', ''))
    );
  }
  apiPayload.field = ['transaction', ...vitalFields];
  apiPayload.query = 'event.type:transaction has:measurements.lcp';
  delete apiPayload.sort;
  return apiPayload;
}

function VitalChartDiscoverQuery(props: Props) {
  return (
    <GenericDiscoverQuery<TableData, {}>
      getRequestPayload={getRequestPayload}
      route="events-stats"
      {...props}
    />
  );
}

export default withApi(VitalChartDiscoverQuery);
