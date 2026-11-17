function Svg({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}
export function ArrowLeft(props) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </Svg>
  );
}
export function ArrowUpRight(props) {
  return (
    <Svg {...props}>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </Svg>
  );
}
export function Check(props) {
  return (
    <Svg {...props}>
      <path d="M5 12l5 5L20 7" />
    </Svg>
  );
}
export function X(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}
export function DownloadSimple(props) {
  return (
    <Svg {...props}>
      <path d="M12 4v12" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </Svg>
  );
}
export function MagnifyingGlass(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l5 5" />
    </Svg>
  );
}
export function WarningCircle(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </Svg>
  );
}
