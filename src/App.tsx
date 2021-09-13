import React from 'react';
import './App.css';

import { BrowserRouter as Router } from "react-router-dom"

import "./firebase"

import IniciarSesion from "./app/Sesion/IniciarSesion"
import CrearCuenta from "./app/Sesion/CrearCuenta"
import CerrarSesion from "./app/Sesion/CerrarSesion"
import Notas from "./app/Notas"

import { ProtectedRoute, InvProtectedRoute } from "./components/Routes"

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(( theme:Theme ) => createStyles({
		root: {
			background: theme.palette.background.default,
  	  		color: theme.palette.text.primary,
			height: "100%"
		}
}))

function App() {
		const { root } = useStyles()

	  return (
		  	<div className={root}>
				  <Router>
						<InvProtectedRoute path="/iniciar-sesion" ><IniciarSesion /></InvProtectedRoute>
						<InvProtectedRoute path="/registrarse" ><CrearCuenta/></InvProtectedRoute>
					  	<InvProtectedRoute path="/restablecer-contraseña">Servicio no disponible por los momentos :(</InvProtectedRoute>
					  	<ProtectedRoute path="/">
					  		<Notas/>
					  	</ProtectedRoute>
				  </Router>
		  	</div>
	  );
}

export default App;
