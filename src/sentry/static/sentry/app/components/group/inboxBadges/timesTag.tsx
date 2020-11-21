import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import TimeSince from 'app/components/timeSince';

/**
 * Used in new inbox
 * Renders the first & last seen times for a group or event with
 * a clock icon.
 */

type Props = {
  lastSeen: string;
  firstSeen: string;
};

const TimesTag = ({lastSeen, firstSeen}: Props) => {
  return (
    <Wrapper>
      {lastSeen && <TimeSince date={lastSeen} suffix={t('ago')} shorten />}
      {firstSeen && lastSeen && (
        <Seperator className="hidden-xs hidden-sm">&nbsp;|&nbsp;</Seperator>
      )}
      {firstSeen && (
        <TimeSince
          date={firstSeen}
          suffix={t('old')}
          className="hidden-xs hidden-sm"
          shorten
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled('div')`
  font-size: ${p => p.theme.fontSizeSmall};
`;

const Seperator = styled('span')`
  color: ${p => p.theme.subText};
`;

export default TimesTag;
