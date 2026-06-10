import LockIcon     from '../icon/error/LockIcon';
import WarningIcon  from '../icon/error/WarningIcon';
import ServerIcon   from '../icon/error/ServerIcon';
import NotFoundIcon from '../icon/error/NotFoundIcon';
import GenericIcon  from '../icon/error/GenericIcon';
import type { ErrorIconType } from '../dto/enums/ErrorIconType';

interface ErrorIconProps {
  type: ErrorIconType;
}

const iconMap: Record<ErrorIconType, React.FC> = {
  'lock':      LockIcon,
  'warning':   WarningIcon,
  'server':    ServerIcon,
  'not-found': NotFoundIcon,
  'generic':   GenericIcon,
};

const ErrorIcon = ({ type }: ErrorIconProps) => {
  const Icon = iconMap[type];
  return <Icon />;
};

export default ErrorIcon;
