import { useAuthContext } from '../../Hooks/useAuthContext';

const TestBoard = () => {
  const { user, token } = useAuthContext();
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', fontFamily: 'monospace' }}>
      <h1>🧪 USER DATA TEST DASHBOARD</h1>
      
      <h2>User Object:</h2>
      <pre style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', overflow: 'auto' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
      
      <h2>Token:</h2>
      <p>
        {token ? `✅ Token exists: ${token.substring(0, 30)}...` : '❌ NO TOKEN'}
      </p>
      
      <h2>Data Breakdown:</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>user is null?</td>
            <td style={{ padding: '10px', color: user === null ? 'red' : 'green' }}>
              {user === null ? 'YES ❌' : 'NO ✅'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>user is undefined?</td>
            <td style={{ padding: '10px', color: user === undefined ? 'red' : 'green' }}>
              {user === undefined ? 'YES ❌' : 'NO ✅'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '10px', fontWeight: 'bold' }}>typeof user</td>
            <td style={{ padding: '10px' }}>{typeof user}</td>
          </tr>
          {user && (
            <>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>user.name</td>
                <td style={{ padding: '10px' }}>{user.name}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>user.email</td>
                <td style={{ padding: '10px' }}>{user.email}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>user.isAdmin</td>
                <td style={{ padding: '10px' }}>
                  {user.isAdmin ? 'YES (admin)' : 'NO (regular user)'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>user.teamId</td>
                <td style={{ padding: '10px' }}>{user.teamId || 'null'}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: '30px' }}>📋 Summary:</h2>
      {user ? (
        <div style={{ padding: '10px', backgroundColor: '#d4edda', border: '1px solid #28a745', borderRadius: '4px' }}>
          ✅ <strong>USER DATA IS WORKING!</strong>
          <p>User "{user.name}" is logged in.</p>
          <p>Context is perfect. Problem is in App.js routing logic.</p>
        </div>
      ) : (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
          ❌ <strong>USER DATA IS NULL!</strong>
          <p>Context is not storing user data.</p>
          <p>Problem is in useAuthContext.js or AuthContext.js</p>
        </div>
      )}
    </div>
  );
};

export default TestBoard;