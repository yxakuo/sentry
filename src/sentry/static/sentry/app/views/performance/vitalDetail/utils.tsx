import {Query} from 'history';

import {WebVital} from 'app/utils/discover/fields';

export function generateVitalDetailRoute({orgSlug}: {orgSlug: String}): string {
  return `/organizations/${orgSlug}/performance/vitaldetail/`;
}

export function vitalDetailRouteWithQuery({
  orgSlug,
  vitalName,
  query,
}: {
  orgSlug: string;
  vitalName: WebVital;
  query: Query;
}) {
  const pathname = generateVitalDetailRoute({orgSlug});
  return {
    pathname,
    query: {
      vitalName,
      environment: query.environment,
      statsPeriod: query.statsPeriod,
      start: query.start,
      end: query.end,
      query: query.query,
    },
  };
}

export const vitalMap: Partial<Record<WebVital, string>> = {
  [WebVital.FP]: 'First Paint',
  [WebVital.FCP]: 'First Contentful Paint',
  [WebVital.CLS]: 'Cumulative Layout Shift',
  [WebVital.FID]: 'First Input Delay',
  [WebVital.LCP]: 'Largest Contentful Paint',
};

export const vitalDescription: Partial<Record<WebVital, string>> = {
  [WebVital.FP]: '', // TODO
  [WebVital.FCP]: '', // TODO
  [WebVital.CLS]: '', // TODO
  [WebVital.FID]:
    'First Input Delay measures the response time when the user tries to interact with the viewport. Actions maybe include clicking a button, link or other custom Javascript controller. It is key in helping the user determine if a page is usable or not.',
  [WebVital.LCP]: '', // TODO
};

export const vitalAbbreviation: Partial<Record<WebVital, string>> = {
  [WebVital.FP]: 'FP',
  [WebVital.FCP]: 'FCP',
  [WebVital.CLS]: 'CLS',
  [WebVital.FID]: 'FID',
  [WebVital.LCP]: 'LCP',
};

type VitalOption = {
  label: string;
  field: string;
};

export const vitalDetailOptions: Partial<Record<WebVital, VitalOption[]>> = {
  [WebVital.FID]: [
    {
      label: 'FID (p75)',
      field: 'p75(measurements.fid)',
    },
  ],
};
