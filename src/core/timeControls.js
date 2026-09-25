/**
 * timeControls — salti temporali della simulazione.
 * Estratto da main.js: lo stato (customDate/timeOffsetMs) resta nel modulo
 * chiamante e viene letto/scritto tramite getter/setter.
 *
 * deps: {
 *   getSimDate(), setCustomDate(date|null),
 *   clickNowBtn(), showHintFn(msg)
 * }
 */
import { t } from '../i18n/index.js';

export function createTimeControls(deps) {
  function jumpToNow() {
    deps.setCustomDate(null);
    deps.clickNowBtn();
    deps.showHintFn(t('back_present'));
  }

  function jumpYears(years) {
    const current = deps.getSimDate();
    const newDate = new Date(
      Date.UTC(current.getUTCFullYear() + years, current.getUTCMonth(), current.getUTCDate())
    );
    deps.setCustomDate(newDate);
    const unit = Math.abs(years) === 1 ? t('unit_year_one') : t('unit_year_other');
    deps.showHintFn(`${years > 0 ? '+' : ''}${years} ${unit}`);
  }

  return { jumpToNow, jumpYears };
}
