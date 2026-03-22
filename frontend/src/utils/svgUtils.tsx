import { ComponentType } from 'react';

type SvgComponent = {
  default: ComponentType<any>;
};

const FailedLoadSvg = () => {
  console.log('Failed to load SVG component');
  return <div></div>;
};

export const loadSvgComponent = async (
  stats: Record<string, () => Promise<unknown>>,
  path: string
): Promise<SvgComponent> => {
  try {
    if (!stats[path]) {
      console.error(`SVG path not found: ${path}`);
      return { default: FailedLoadSvg };
    }
    const module = await stats[path]();
    if (!module) {
      console.error(`SVG module is undefined: ${path}`);
      return { default: FailedLoadSvg };
    }
    return { default: module as ComponentType<any> };
  } catch (error) {
    console.error(`Error loading SVG ${path}:`, error);
    return { default: FailedLoadSvg };
  }
};
