import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { userAPI } from '../../services/api';

const Card = styled.div`
  background: #141414;
  border: 1px solid #222222;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: #FAFAFA;
  margin: 0;
`;

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const ScoreLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color || '#FAFAFA'};
`;

const ScoreSub = styled.span`
  font-size: 11px;
  color: #52525B;
`;

const ComponentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CompRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CompHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CompName = styled.span`
  font-size: 11px;
  color: #71717A;
`;

const CompRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompDetail = styled.span`
  font-size: 10px;
  color: #52525B;
`;

const CompScore = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #A1A1AA;
  min-width: 28px;
  text-align: right;
`;

const MiniBar = styled.div`
  height: 3px;
  background: #1E1E1E;
  border-radius: 99px;
  overflow: hidden;
`;

const MiniBarFill = styled.div`
  height: 100%;
  border-radius: 99px;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $color }) => $color || '#DC2626'};
  transition: width 0.6s ease;
`;

const Empty = styled.div`
  text-align: center;
  color: #52525B;
  font-size: 12px;
  padding: 16px 0;
  line-height: 1.6;
`;

// Gauge: cx=90, cy=86, radius=68 → top of arc at y=18, flat edge at y=86
// viewBox crops dead space: starts at y=12, height=80 (shows y=12..92)
const CX = 90;
const CY = 86;
const R = 68;
const CIRCUMFERENCE = Math.PI * R;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`;

function GaugeArc({ score, color }) {
  const p = Math.max(0, Math.min(100, score)) / 100;

  return (
    <svg viewBox="18 12 144 78" width="100%" style={{ display: 'block', maxWidth: 200, margin: '0 auto' }}>
      {/* Track */}
      <path d={ARC} fill="none" stroke="#1E1E1E" strokeWidth="9" strokeLinecap="round" />
      {/* Fill */}
      {p > 0 && (
        <path
          d={ARC}
          fill="none"
          stroke={color || '#DC2626'}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${p * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        />
      )}
      {/* Score */}
      <text
        x={CX}
        y={CY - 14}
        textAnchor="middle"
        fill="#FAFAFA"
        fontSize="26"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
    </svg>
  );
}

export default function HealthScoreWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getHealthScore()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <Title>Financial Health Score</Title>
      {loading ? (
        <Empty>Loading…</Empty>
      ) : !data ? (
        <Empty>Could not load score</Empty>
      ) : data.empty ? (
        <Empty>Connect a bank account and set a budget to see your financial health score.</Empty>
      ) : (
        <>
          <GaugeWrap>
            <GaugeArc score={data.score} color={data.color} />
            <ScoreRow>
              <ScoreLabel $color={data.color}>{data.label}</ScoreLabel>
              <ScoreSub>· {data.score} / 100</ScoreSub>
            </ScoreRow>
          </GaugeWrap>
          <ComponentList>
            {data.components.map((c) => (
              <CompRow key={c.name}>
                <CompHeader>
                  <CompName>{c.name}</CompName>
                  <CompRight>
                    <CompDetail>{c.detail}</CompDetail>
                    <CompScore>{c.score}/{c.max}</CompScore>
                  </CompRight>
                </CompHeader>
                <MiniBar>
                  <MiniBarFill $pct={(c.score / c.max) * 100} $color={data.color} />
                </MiniBar>
              </CompRow>
            ))}
          </ComponentList>
        </>
      )}
    </Card>
  );
}
