import { useState, useEffect, SyntheticEvent } from "react"
import { Avatar, Button, Container, Grid, Paper, Typography, TextField } from "@material-ui/core"
import { Link } from "react-router-dom"

import { makeStyles, Theme } from "@material-ui/core/styles"
import { useSnackbar } from "notistack"

import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { auth } from "../../firebase"
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';

const useStyles = makeStyles(( theme:Theme ) => ({
	container: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center"
	},
	avatar: {
		margin: theme.spacing(1),
	},
	form:{
		marginTop: theme.spacing(2),
		width: "100%"
	},
	submit: {
		margin: theme.spacing(3, 0, 2) 
	}
}))


export default function IniciarSesion() {
	const { enqueueSnackbar } = useSnackbar()
	const estilos = useStyles()

	const [ claveVisible, setClaveVisible ] = useState(false)

	const [
    	signInWithEmailAndPassword,
    	usuario,
    	cargando,
    	error,
  	] = useSignInWithEmailAndPassword(auth);

	async function onIngresar( e:SyntheticEvent) {
		e.preventDefault()
        const target = e.target as typeof e.target & {
        	email: { value:string },
        	password: { value:string }
        }
        const correo = target.email.value
        const clave = target.password.value

		signInWithEmailAndPassword(correo, clave)
	}

	useEffect(() => {
		if ( error ) enqueueSnackbar(error.message, { variant: "error" })
	}, [ error, enqueueSnackbar ])

	return (
		<Container maxWidth="xs" component="main" className={estilos.container}>
				<Avatar className={estilos.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<header>
					<Typography variant="h5" className="text-center">Iniciar sesión</Typography>
				</header>
				<form className={estilos.form} onSubmit={onIngresar}>
					<TextField 
						margin="normal"
						fullWidth
						required
						autoFocus
						label="Correo"	
						variant="outlined"
						autoComplete="email"
						type="email"
						name="email"
					/>
					<TextField 
						margin="normal"
						fullWidth
						required
						label="Contraseña"
						variant="outlined"
						autoComplete="password"
						name="password"
						type={claveVisible? "text" :"password"}
						InputProps={{
							endAdornment: (
								claveVisible?
									<VisibilityOffIcon onClick={() => setClaveVisible(false)} />
									:
									<VisibilityIcon onClick={() => setClaveVisible(true)} />
								)
						}}
					/>
					<Button 
						fullWidth 
						variant="contained" 
						className={estilos.submit} 
						disabled={cargando}
						color="primary"
						type="submit"	
					>
						Ingresar
					</Button>
					<Grid container>
						<Grid item xs>
							<Link to="/restablecer-contraseña" >
								<Typography variant="subtitle2">
									{"¿Olvidaste tu contraseña?"}
								</Typography>
							</Link>
						</Grid>
						<Grid item>
							<Link to="/registrarse" >
								<Typography variant="subtitle2">
									{"¿No tenés una cuenta?"}
								</Typography>
							</Link>
						</Grid>
					</Grid>
				</form> 
		</Container>
	)
}