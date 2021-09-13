import { ReactNode } from "react"
import { useAuthState } from 'react-firebase-hooks/auth';
import { Redirect, Route, RouteComponentProps, useLocation } from 'react-router-dom'

import { auth } from "../firebase"

interface RouteProps {
	children: ReactNode
	[x:string]: any
}

export function ProtectedRoute({ children, ...rest }: RouteProps) {
  	const [ usuario ] = useAuthState(auth);
	return (
		<Route 
			{...rest}
			render={( props ) => {
				if ( !usuario )	return <Redirect to="iniciar-sesion" />
				return <>{children}</>
			}}
		/>
	)
}

export function InvProtectedRoute({ children, ...rest }: RouteProps) {
	const [ usuario ] = useAuthState(auth);

	const location = useLocation()
	let { from } = ( location.state as { from: { pathname: string } } ) || { from: { pathname: "/" } };

	return (
		<Route 
			{...rest}
			render={( props ) => {
				if ( usuario )	return <Redirect to={from.pathname} />
				return <>{children}</>
			}}
		/>
	)
}