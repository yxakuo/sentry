import React from 'react';
import styled from '@emotion/styled';
import {Location} from 'history';

import space from 'app/styles/space';
import EventView from 'app/utils/discover/eventView';
import {Organization} from 'app/types';
import {Panel} from 'app/components/panels';
import {formatPercentage} from 'app/utils/formatters';
import VitalsCardDiscoverQuery from 'app/views/performance/vitalDetail/vitalsCardsDiscoverQueryiscoverQuery';
import {WebVital} from 'app/utils/discover/fields';
import {vitalAbbreviation} from './vitalDetail/utils';

type Props = {
  eventView: EventView;
  organization: Organization;
  location: Location;
};

export default function VitalsCards(props: Props) {
  const {eventView, organization, location} = props;
  const vitalsView = eventView.clone();
  return (
    <VitalsCardDiscoverQuery
      eventView={vitalsView}
      orgSlug={organization.slug}
      location={location}
    >
      {({isLoading, tableData}) => (
        <React.Fragment>
          <VitalsContainer>
            <VitalsCard
              vitalName={WebVital.FP}
              tableData={tableData}
              isLoading={isLoading}
            />
            <VitalsCard
              vitalName={WebVital.FCP}
              tableData={tableData}
              isLoading={isLoading}
            />
            <VitalsCard
              vitalName={WebVital.LCP}
              tableData={tableData}
              isLoading={isLoading}
            />
            <VitalsCard
              vitalName={WebVital.FID}
              tableData={tableData}
              isLoading={isLoading}
            />
            <VitalsCard
              vitalName={WebVital.CLS}
              tableData={tableData}
              isLoading={isLoading}
            />
          </VitalsContainer>
        </React.Fragment>
      )}
    </VitalsCardDiscoverQuery>
  );
}

const VitalsContainer = styled('div')`
  display: grid;
  grid-auto-flow: column;
  gap: ${space(2)};
`;

type CardProps = {
  vitalName: WebVital;
  tableData: any;
  isLoading?: boolean;
  noBorder?: boolean;
};

const NonPanel = styled('div')`
  flex-grow: 1;
`;

const Card = styled(Panel)`
  padding: ${space(2)};
  cursor: pointer;
`;

const StyledQueryCard = styled(Card)`
  &:focus,
  &:hover {
    top: -1px;
    box-shadow: 0px 0px 0px 6px rgba(209, 202, 216, 0.2);
    position: relative;
    outline: none;
  }
`;

export function VitalsCard(props: CardProps) {
  const {isLoading, tableData, vitalName, noBorder} = props;

  const measurement = vitalAbbreviation[vitalName];

  const Container = noBorder ? NonPanel : StyledQueryCard;

  if (isLoading || !tableData || !tableData.data || !tableData.data[0]) {
    return (
      <Container>
        <CardTitle>Total Passing {measurement}</CardTitle>
        <CardValue>-</CardValue>
      </Container>
    );
  }

  const result = tableData.data[0];

  const value = formatPercentage(
    1 - parseFloat(result[`${measurement}_percentage`] || 1)
  );

  return (
    <Container>
      <CardTitle>Total Passing {measurement}</CardTitle>
      <CardValue>{value}</CardValue>
    </Container>
  );
}

const CardTitle = styled('div')`
  font-size: ${p => p.theme.fontSizeLarge};
  margin-bottom: ${space(1)};
`;
const CardValue = styled('div')`
  font-size: 30px;
`;
