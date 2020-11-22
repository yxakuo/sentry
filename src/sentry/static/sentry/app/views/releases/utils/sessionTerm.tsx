import {PlatformKey} from 'app/data/platformCategories';
import {t} from 'app/locale';

export const sessionTerm = {
  crashes: t('Crashes'),
  crashed: t('Crashed'),
  abnormal: t('Abnormal'),
  'crash-free-users': t('Crash Free Users'),
  'crash-free-sessions': t('Crash Free Sessions'),
  healthy: t('Healthy'),
  errored: t('Errored'),
  unhandled: t('Unhandled'),
};

const commonTermsDescription = {
  [sessionTerm.crashes]: t('Number of sessions with a crashed state'),
  [sessionTerm['crash-free-users']]: t(
    'Number of unique users with non-crashed sessions'
  ),
  [sessionTerm['crash-free-sessions']]: t('Number of non-crashed sessions'),
};

const mobileTermsDescription = {
  [sessionTerm.crashed]: t(
    'The process was terminated due to an unhandled exception or a request to the server that ended with an error'
  ),
  'crash-free-sessions': t('Number of unique sessions that did not experience a crash'),
  [sessionTerm.abnormal]: t(
    'An unknown session exit. Like due to loss of power or killed by the operating system'
  ),
  [sessionTerm.healthy]: t('A session without any errors'),
  [sessionTerm.errored]: t('A crash which experienced errors'),
  [sessionTerm.unhandled]: t('Not handled by user code'),
};

const desktopTermDescriptions = {
  [sessionTerm.crashed]: t('The application crashed with a hard crashed (eg. segfault)'),
  [sessionTerm.abnormal]: t(
    'The application did not properly end the session, for example, due to force-quit'
  ),
  [sessionTerm.healthy]: t(
    'The application exited normally and did not observe any errors'
  ),
  [sessionTerm.errored]: t(
    'The application exited normally but observed error events while running'
  ),
  [sessionTerm.unhandled]: t('The application crashed with a hard crashed'),
};

function getTermDescriptions(platform: PlatformKey) {
  const technology = platform.includes('javascript') ? platform.split('-')[0] : platform;

  switch (technology) {
    case 'dotnet':
    case 'java':
      return {
        ...commonTermsDescription,
        ...mobileTermsDescription,
      };
    case 'java-spring':
    case 'dotnet-aspnetcore':
      return {
        ...commonTermsDescription,
        ...mobileTermsDescription,
        [sessionTerm.crashes]: t(
          'A request that resulted in an unhandled exception and hence a Server Error response'
        ),
      };
    case 'android':
    case 'cordova':
    case 'react-native':
    case 'flutter':
      return {
        ...commonTermsDescription,
        ...mobileTermsDescription,
        [sessionTerm.crashed]: t(
          'An unhandled exception that result in the application crashing'
        ),
      };

    case 'apple': {
      return {
        ...commonTermsDescription,
        ...mobileTermsDescription,
        [sessionTerm.crashed]: t('An error that resulted in the application crashing'),
      };
    }
    case 'node':
    case 'javascript':
      return {
        ...commonTermsDescription,
        [sessionTerm.crashed]: t(
          "During session an error with mechanism.handled===false occured which is 'onerror' on 'unhandledrejection' handler"
        ),
        [sessionTerm.abnormal]: t('Non applicable for Javascript'),
        [sessionTerm.healthy]: t('No errors captured during session life-time'),
        [sessionTerm.errored]: t(
          'During the session at least one error occurred that did not bubble up to the global handlers, not resulting in the application loading process crashing.'
        ),
        [sessionTerm.unhandled]:
          'En error bubbled up to the global onerror or onunhandledrejection handler',
      };
    case 'apple-ios':
    case 'minidump':
    case 'native':
      return {
        ...commonTermsDescription,
        ...desktopTermDescriptions,
      };
    case 'rust':
      return {
        ...commonTermsDescription,
        ...desktopTermDescriptions,
        [sessionTerm.crashed]: t('The application had an unrecovable error (a panic)'),
      };
    default:
      return {
        ...commonTermsDescription,
        [sessionTerm.crashed]: t('Number of users who experienced an unhandled error'),
        [sessionTerm.abnormal]: t('An unknown session exit'),
        [sessionTerm.healthy]: mobileTermsDescription.healthy,
        [sessionTerm.errored]: mobileTermsDescription.errored,
        [sessionTerm.unhandled]: mobileTermsDescription.unhandled,
      };
  }
}

type Term = keyof typeof sessionTerm;

export function getSessionTermDescription(term: Term, platform: PlatformKey) {
  return getTermDescriptions(platform)[term];
}
