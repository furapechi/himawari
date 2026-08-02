import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowRight(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function ArrowUp(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 14 6-6 6 6" /></svg>;
}

export function Phone(props: IconProps) {
  return <svg {...base} {...props}><path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.9Z" /></svg>;
}

export function Mail(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}

export function MapPin(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}

export function Train(props: IconProps) {
  return <svg {...base} {...props}><rect x="5" y="3" width="14" height="15" rx="3" /><path d="M8 21l2-3m6 3-2-3M8 7h8M7 12h10" /><circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" /></svg>;
}

export function Instagram(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" /></svg>;
}

export function Menu(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function Close(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function SoccerBall(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="m12 7 3 2.2-1.1 3.5h-3.8L9 9.2 12 7Zm-7.7 3.1L9 9.2M6.7 17l3.4-4.3m3.8 0 3.4 4.3m2.4-6.9L15 9.2M9.2 20.5 6.7 17m8.1 3.5 2.5-3.5" /></svg>;
}

export function Users(props: IconProps) {
  return <svg {...base} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

export function Chat(props: IconProps) {
  return <svg {...base} {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></svg>;
}

export function Heart(props: IconProps) {
  return <svg {...base} {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>;
}

export function Sparkles(props: IconProps) {
  return <svg {...base} {...props}><path d="m12 3-1.1 3.4L7.5 7.5l3.4 1.1L12 12l1.1-3.4 3.4-1.1-3.4-1.1L12 3ZM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Zm13-1-1 3-3 1 3 1 1 3 1-3 3-1-3-1-1-3Z" /></svg>;
}

export function Palette(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 0-14h-2Z" /><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="9.5" cy="6.5" r="1" fill="currentColor" stroke="none" /><circle cx="14" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="17" cy="9" r="1" fill="currentColor" stroke="none" /></svg>;
}

export function Calendar(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
}

export function Clipboard(props: IconProps) {
  return <svg {...base} {...props}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4a3 3 0 0 1 6 0v2H9V4Zm0 7h6m-6 4h6" /></svg>;
}

export function Shield(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function Clock(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

export function Document(props: IconProps) {
  return <svg {...base} {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg>;
}

export function Check(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function ChevronDown(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 9 6 6 6-6" /></svg>;
}

export function Send(props: IconProps) {
  return <svg {...base} {...props}><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></svg>;
}

export function ExternalLink(props: IconProps) {
  return <svg {...base} {...props}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}
