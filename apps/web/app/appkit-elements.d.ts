// Reown AppKit registers <appkit-button> / <appkit-network-button> as custom elements
// once `createAppKit()` runs (see lib/reown.ts). Declare them for JSX.
declare namespace JSX {
  interface IntrinsicElements {
    "appkit-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    "appkit-network-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
