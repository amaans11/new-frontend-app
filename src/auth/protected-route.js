import React from "react"
import { Route } from "react-router-dom"
import { withAuthenticationRequired } from "@auth0/auth0-react"

const ProtectedRoute = ({ component, path, ...args }) => {
    return ( 
    <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: () => <div>Application is Loading</div>,
      loginOptions: {
        redirectUri: `${window.location.origin}${path}`
      }
    })}
    {...args}
  />)
  };

export default ProtectedRoute;