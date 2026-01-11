/**
 * 반응형 유틸리티 함수
 */

export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
} as const;

export function isMobile(width: number): boolean {
  return width < breakpoints.mobile;
}

export function isTablet(width: number): boolean {
  return width >= breakpoints.mobile && width < breakpoints.tablet;
}

export function isDesktop(width: number): boolean {
  return width >= breakpoints.desktop;
}

export function getResponsiveValue<T>(
  mobile: T,
  tablet: T,
  desktop: T,
  width: number
): T {
  if (isMobile(width)) return mobile;
  if (isTablet(width)) return tablet;
  return desktop;
}
