import React from 'react'
import { AppBar, Toolbar, Button, Avatar, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import { useAuth0 } from '@auth0/auth0-react'
import { Link, useLocation } from 'react-router-dom'
import c3Logo from '../assets/images/c3Logo.png'
// import logo from './images/1_a.png'

const NavigationBar = (props) => {
  const styles = useStyles()
  const { isAuthenticated, logout, user, loading } = useAuth0() || {}
  const currentLocation = useLocation().pathname
  return (
    <div>
      <AppBar position='static' className={styles.appBar} elevation={1}>
        <Toolbar className={styles.toolbar}>
          <Link to={{ pathname: '/' }}>
            <img className={styles.logo} src={c3Logo} />
          </Link>
          {currentLocation !== '/' && 
            <Typography component='div' variant='h4' className={styles.currentNavigationLabel}>
              The Answer
            </Typography>}
          <div className={styles.padding}></div>
          <Button
            classes={{
              label: styles.logoutLabel
            }}
            disabled={!isAuthenticated}
            onClick={() => logout()}
            >
            Logout
          </Button>
          {isAuthenticated && !loading && <Avatar alt='Current User' src={user.picture} />}
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default NavigationBar

const useStyles = makeStyles(theme => {
  return {
    toolbar: {
      display: 'flex'
    },
    padding: {
      flexGrow: 1
    },
    logoutLabel: {
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(3)
    },
    appBar: {
      backgroundColor: theme.palette.background.paper,
      minHeight: '50px',
      padding: '15px',
      zIndex: theme.zIndex.drawer + 1,
      position: 'fixed'
    },
    logo: {
      width: 'auto',
      height: '50px',
      marginRight: theme.spacing(3)
    },
    currentNavigationLabel: {
      color: theme.palette.text.primary
    }
  }
})
