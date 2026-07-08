// custom file-type icons (EDS does not include these)

import type { SVGProps } from "react";

type SvgIconProps = SVGProps<SVGSVGElement> & {
  size?: "xsmall" | "small" | "medium" | "large";
  title?: string;
};

const sizeMap = {
  xsmall: "0.75rem",
  small: "1rem",
  medium: "1.5rem",
  large: "2rem",
};

// generic document / PDF icon
export function IconDocument({ size = "small", title, ...rest }: SvgIconProps) {
  const dim = sizeMap[size];
  return (
    <svg
      height={dim}
      width={dim}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      {...rest}
    >
      {title && <title>{title}</title>}
      {/* page outline with folded top-right corner */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 1.5A1.5 1.5 0 0 1 3.5 0h6.379a1.5 1.5 0 0 1 1.06.44l2.622 2.621A1.5 1.5 0 0 1 14 4.121V14.5A1.5 1.5 0 0 1 12.5 16h-9A1.5 1.5 0 0 1 2 14.5zm1.5-1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V4.414L10.086 1.5zM4 7h8v1H4zm0 2.5h8v1H4zm0 2.5h5v1H4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// image / photo icon
export function IconImage({ size = "small", title, ...rest }: SvgIconProps) {
  const dim = sizeMap[size];
  return (
    <svg
      height={dim}
      width={dim}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      {...rest}
    >
      {title && <title>{title}</title>}
      {/* frame */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v8.086l2.646-2.647a.5.5 0 0 1 .708 0L7.5 10.086l2.646-2.647a.5.5 0 0 1 .708 0L13.5 10.086V2.5a.5.5 0 0 0-.5-.5zm9.5 9.5-2.646-2.647L7.207 11H13.5v-.5zM2.5 14h11a.5.5 0 0 0 .5-.5V11.5l-3.5-3.5-2.646 2.647a.5.5 0 0 1-.708 0L4.5 7.5 2 10v3.5a.5.5 0 0 0 .5.5zm7-8.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
