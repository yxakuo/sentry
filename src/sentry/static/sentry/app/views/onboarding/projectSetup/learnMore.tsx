import React from 'react';
import styled from '@emotion/styled';

import Alert from 'app/components/alert';
import Panel from 'app/components/panels/panel';
import PanelBody from 'app/components/panels/panelBody';
import {t, tct} from 'app/locale';
import space from 'app/styles/space';
import getDynamicText from 'app/utils/getDynamicText';
import CreateSampleEventButton from 'app/views/onboarding/createSampleEventButton';

import {StepProps} from '../types';

const LEARN_MORE_VIDEO = 'https://player.vimeo.com/video/319554213';

const learnMoveVideo = getDynamicText({
  fixed: 'Video Demo Placeholder',
  value: (
    <iframe
      src={LEARN_MORE_VIDEO}
      frameBorder="0"
      allow="autoplay; fullscreen"
      allowFullScreen
    />
  ),
});

const LearnMore = ({project}: StepProps) => (
  <React.Fragment>
    <DemoVideo>{learnMoveVideo}</DemoVideo>
    {project ? (
      <Panel>
        <SampleEventPanelBody withPadding>
          {tct(
            `Want to see more of what Sentry can do before integrating into your
           application? Create a [strong:Sample Error Event] and poke around to
           get a better feel for the Sentry workflow.`,
            {strong: <strong />}
          )}
          <CreateSampleEventButton
            project={project}
            source="onboarding_setup"
            priority="primary"
          >
            {t('Create A Sample Event')}
          </CreateSampleEventButton>
        </SampleEventPanelBody>
      </Panel>
    ) : (
      <Alert type="info">{t('Create a project to view a sample event!')}</Alert>
    )}
  </React.Fragment>
);

const DemoVideo = styled(Panel)`
  display: flex;
  justify-content: center;
  overflow: hidden;
  margin-bottom: ${space(2)};

  /* 16:9 aspect ratio */
  position: relative;
  padding-top: 56.2%;

  iframe {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  }
`;

const SampleEventPanelBody = styled(PanelBody)`
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: ${space(2)};
  align-items: center;
`;

export default LearnMore;
