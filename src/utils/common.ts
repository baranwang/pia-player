import { closest } from 'color-diff';

import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag';

class FindTagColor {
  private tagColors: TagColor[] = [
    'amber',
    'blue',
    'cyan',
    'green',
    'indigo',
    'light-blue',
    'light-green',
    'lime',
    'orange',
    'pink',
    'purple',
    'red',
    'teal',
    'violet',
    'yellow',
  ];

  private taggColorsRgb!: Record<TagColor, { R: number; G: number; B: number }>;

  constructor() {
    this.taggColorsRgb = this.tagColors.reduce((acc, color) => {
      acc[color] = this.getCssVarToRgb(`--semi-${color}-8`);
      return acc;
    }, {} as Record<TagColor, { R: number; G: number; B: number }>);
  }

  private getCssVarToRgb(name: string) {
    const cssVar = getComputedStyle(document.body).getPropertyValue(name);
    const [R, G, B] = cssVar.split(',').map(Number);
    return { R, G, B };
  }

  private hexToRgb(hex: string) {
    const R = parseInt(hex.slice(1, 3), 16);
    const G = parseInt(hex.slice(3, 5), 16);
    const B = parseInt(hex.slice(5, 7), 16);
    return { R, G, B };
  }

  findClosestTagColor(targetHex: string): TagColor | undefined {
    if (!targetHex) {
      return undefined;
    }
    const palette = Object.values(this.taggColorsRgb);
    const rgb = closest(this.hexToRgb(targetHex), palette);
    return Object.entries(this.taggColorsRgb).find(([_, value]) => value === rgb)?.[0] as TagColor;
  }
}

export const findClosestTagColor = new FindTagColor().findClosestTagColor.bind(new FindTagColor());
