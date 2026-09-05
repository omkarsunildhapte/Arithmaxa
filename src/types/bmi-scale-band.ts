/** One band of the BMI scale bar under the score. `width` is the band's share
 *  of the bar in percent — a visual proportion, not a real BMI boundary. */
export interface BmiScaleBand {
  band: string;
  /** Tailwind background utility. Written as a complete literal class so
   *  Tailwind's scanner can find it here; building it from parts
   *  (`'bg-' + colour + '-400'`) would produce an unstyled bar. */
  class: string;
  width: number;
}
