import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import ProtectedRoute from './auth/protected-route'
import DataTableContainer from './components/DataTableContainer'
import PublicHomePage from './components/PublicHomePage'
import NavigationBar from './components/NavigationBar'
import { makeStyles } from '@material-ui/styles'
import { useAuth0 } from '@auth0/auth0-react'
import Dashboard from './components/Dashboard'

const useStyles = makeStyles(theme => {
  return {
    bodyContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: 'inherit',
      backgroundColor: theme.palette.background.default,
      alignItems: 'center',
      flexGrow: 1
    },
    appContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }
  }
})

function App() {
  const styles = useStyles()
  const { isAuthenticated, isLoading } = useAuth0()
  return (
    <div className={styles.appContainer}>
      <NavigationBar/>
      <div className={styles.bodyContainer}>
        <Switch>
          {!isLoading && <Route exact path='/'>{isAuthenticated ? <Redirect to='/dashboard'/> : <PublicHomePage />}</Route>}
          <ProtectedRoute exact path='/dashboard' component={Dashboard} />
          <ProtectedRoute exact path='/old-dashboard' component={DataTableContainer} />
        </Switch>
      </div>  
    </div>
  );
}

export default App;
