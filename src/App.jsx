import { useAuth } from './hooks/useAuth';
import { getSchoolTheme } from './config/schools';

function App() {
  const { user } = useAuth();
  const theme = getSchoolTheme(user?.school);

  return (
    <div
      style={{
        '--color-primary': theme.primary,
        '--color-accent': theme.accent,
      }}
    >
      {/* rest of your app */}
    </div>




  );
}


export default App;