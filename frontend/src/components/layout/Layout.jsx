import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0A0A0A;
`;

const Main = styled.div`
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Content = styled.main`
  flex: 1;
  padding: 20px 24px;
  overflow-x: hidden;
`;

export default function Layout() {
  return (
    <Shell>
      <Sidebar />
      <Main>
        <Header />
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Shell>
  );
}
