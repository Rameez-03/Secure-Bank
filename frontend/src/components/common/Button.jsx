import styled, { css } from 'styled-components';

const variants = {
  primary: css`
    background: #DC2626;
    color: #FAFAFA;
    border: 1px solid #DC2626;
    &:hover:not(:disabled) { background: #B91C1C; border-color: #B91C1C; }
    &:active:not(:disabled) { background: #991B1B; }
  `,
  outline: css`
    background: transparent;
    color: #A1A1AA;
    border: 1px solid #222222;
    &:hover:not(:disabled) { border-color: #3F3F46; color: #FAFAFA; background: #1A1A1A; }
  `,
  ghost: css`
    background: transparent;
    color: #A1A1AA;
    border: 1px solid transparent;
    &:hover:not(:disabled) { background: #1A1A1A; color: #FAFAFA; }
  `,
  danger: css`
    background: rgba(220,38,38,0.10);
    color: #DC2626;
    border: 1px solid rgba(220,38,38,0.25);
    &:hover:not(:disabled) { background: rgba(220,38,38,0.18); }
  `,
};

const sizes = {
  sm: css` padding: 6px 12px; font-size: 12px; border-radius: 6px; `,
  md: css` padding: 9px 18px; font-size: 13px; border-radius: 8px; `,
  lg: css` padding: 12px 24px; font-size: 14px; border-radius: 10px; `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
  ${({ $variant }) => variants[$variant] || variants.primary}
  ${({ $size }) => sizes[$size] || sizes.md}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) {
  return (
    <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...props}>
      {children}
    </StyledButton>
  );
}
