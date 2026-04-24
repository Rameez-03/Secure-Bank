import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #A1A1AA;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  background: #141414;
  border: 1px solid #222222;
  border-radius: 8px;
  padding: 10px 14px;
  padding-right: ${({ $hasIcon }) => ($hasIcon ? '40px' : '14px')};
  color: #FAFAFA;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s ease;
  outline: none;

  &::placeholder { color: #52525B; }
  &:focus { border-color: #DC2626; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const IconBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #52525B;
  display: flex;
  align-items: center;
  padding: 0;
  &:hover { color: #A1A1AA; }
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #DC2626;
`;

export default function Input({
  label,
  error,
  icon,
  onIconClick,
  ...props
}) {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        <StyledInput $hasIcon={!!icon} {...props} />
        {icon && <IconBtn type="button" onClick={onIconClick}>{icon}</IconBtn>}
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
