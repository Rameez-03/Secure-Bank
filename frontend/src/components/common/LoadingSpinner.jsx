import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $fullScreen }) =>
    $fullScreen &&
    `
    position: fixed;
    inset: 0;
    background: #0A0A0A;
    z-index: 9999;
  `}
  ${({ $fill }) => $fill && `flex: 1; min-height: 200px;`}
`;

const Ring = styled.div`
  width: ${({ $size }) => $size || 32}px;
  height: ${({ $size }) => $size || 32}px;
  border: 2.5px solid #222222;
  border-top-color: #DC2626;
  border-radius: 50%;
  animation: ${spin} 0.65s linear infinite;
`;

export default function LoadingSpinner({ fullScreen, fill, size }) {
  return (
    <Wrapper $fullScreen={fullScreen} $fill={fill}>
      <Ring $size={size} />
    </Wrapper>
  );
}
