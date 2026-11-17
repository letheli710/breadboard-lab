import { tr } from '../core/i18n';
import { Icon } from './Icons';

/** Why simulated values show "—" on a lab with unanswered measurement questions. */
export function HiddenReadingsNote() {
  return (
    <p className="note hidden-readings" role="note">
      <Icon name="lock" size={14} />{' '}
      {tr(
        '实验进行中：仿真算出的电压、电流先隐藏——用电流表、万用表和示波器自己测。答完全部测量题后会重新显示。',
        'Lab in progress: simulated voltages and currents are hidden — measure them with the ammeter, multimeter and scope. They come back once all measurement questions are answered.',
      )}
    </p>
  );
}

export const hiddenReadingsText = () => tr('读数已隐藏：用仪表测', 'hidden: measure it');
