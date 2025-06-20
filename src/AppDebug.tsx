import ChatLauncher from './components/agents/ChatLauncher';

function AppDebug() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <h1 style={{ color: 'white', padding: '20px' }}>Canvas Debug Mode</h1>
      <ChatLauncher />
    </div>
  );
}

export default AppDebug;