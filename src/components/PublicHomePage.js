import { makeStyles } from "@material-ui/core"
import splashImage from '../assets/images/splashPage.jpg'
import { Typography, ButtonBase, Paper } from '@material-ui/core'
import React from "react"
import { useAuth0 } from "@auth0/auth0-react"


const useStyles = makeStyles(theme => {
  return {
    container: {
      backgroundImage: `url(${splashImage})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      height: '75vh',
      display: 'flex',
      flexDirection: 'row', 
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%'
    },
    titleField: {
      color: '#fff',
      marginBottom: '50px',
      textTransform: 'uppercase',
      fontWeight: 'bold'
    },
    overlay: {
      minWidth: '500px',
      padding: '50px',
      background: "rgba(0, 8, 39, 0.5)",
      borderRadius: '10px'
    },
    loginButton: {
      color: '#fff'
    },
    loginButtonOuter: {
      color: '#fff',
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
      border: '4px solid transparent',
      textTransform: 'uppercase'
    },
    loginButtonMarked: {
      height: 3,
      width: 18,
      backgroundColor: '#fff',
      position: 'absolute',
      bottom: 0,
      left: 'calc(50% - 9px)',
      transition: theme.transitions.create('opacity'),
    },
    focusVisible: {},
    loginBase: {
      '&:hover, &$focusVisible': {
        zIndex: 1,
        '& $imageBackdrop': {
          opacity: 0.15,
        },
        '& $loginButtonMarked': {
          opacity: 0,
        },
        '& $loginButtonOuter': {
          border: '4px solid #fff',
        },
      }
    }
  }
})


const PublicHomePage = (props) => {
  const styles = useStyles()

  const { loginWithRedirect } = useAuth0()

  return (
    <div className={styles.container}>
      <Paper elevation={0} className={styles.overlay}>
        <Typography className={styles.titleField} variant='h3' align='center'>    
          The Answer
        </Typography>
        <ButtonBase
          focusRipple
          focusVisibleClassName={styles.focusVisible}
          className={styles.loginBase}
          onClick={() => loginWithRedirect({ redirectUri: `${window.location.origin}/dashboard` })}
        >
          <span className={styles.loginButtonOuter}>
            <Typography component='span' variant='subtitle1' className={styles.loginButtonInner}>
              Login
              <span className={styles.loginButtonMarked}/>
            </Typography>
          </span>
        </ButtonBase>
      </Paper>
    </div>
  );
}

export default PublicHomePage