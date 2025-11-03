type SvgComponent = {
  default: ({ className }: { className?: string }) => JSX.Element;
};

const FailedLoadSvg = () => {
  console.log('Failed to load SVG');
  return <div>Failed to load SVG</div>;
};

export const loadSvgComponent = async (
  stats: Record<string, () => Promise<unknown>>,
  path: string
): Promise<SvgComponent> => {
  try {
    const url = await stats[path]() as string;
    // Return a component that renders an img tag with the SVG URL
    return {
      default: ({ className }: { className?: string }) => (
        <img src={url} alt="SVG" className={className} />
      ),
    };
  } catch (error) {
    console.error('Error loading SVG:', error);
    return { default: FailedLoadSvg };
  }
};
