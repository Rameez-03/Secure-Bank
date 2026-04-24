import styled from 'styled-components';
import { Flame } from 'lucide-react';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  font-weight: 700;
  color: #D97706;
`;

const Dots = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Dot = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $filled }) =>
    $filled ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'transparent'};
  border: 1.5px solid ${({ $filled }) => ($filled ? '#D97706' : '#2A2A2A')};
  transition: all 0.2s;
`;

const Message = styled.p`
  font-size: 12px;
  color: #71717A;
  margin: 0;
`;

const MAX_DOTS = 20;

export default function StreaksWidget({ streaks = 0 }) {
  const display = Math.min(streaks, MAX_DOTS);
  const dots = Array.from({ length: MAX_DOTS }, (_, i) => i < display);

  return (
    <Card>
      <Row>
        <Title>Streaks</Title>
        <Count>
          <Flame size={18} />
          {streaks}
        </Count>
      </Row>
      <Dots>
        {dots.map((filled, i) => (
          <Dot key={i} $filled={filled} />
        ))}
      </Dots>
      <Message>
        {streaks === 0
          ? 'Start tracking to build your streak!'
          : streaks === 1
          ? 'Great start! Keep it going!'
          : `Great! You have a ${streaks}-day streak! 🎉`}
      </Message>
    </Card>
  );
}
