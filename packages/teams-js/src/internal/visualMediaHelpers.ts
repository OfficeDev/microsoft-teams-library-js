/**
 * @hidden
 * All properties common to Image and Video Props
 *
 * @beta
 */
export interface VisualMediaProps {
  /**
   * @hidden
   * The maximum number of media items that can be selected at once is limited to values that are less than or equal to the maximum visual media selection limit.
   */
  maxVisualMediaCount: number;
}

export const maxVisualMediaSelectionLimit = 10;
