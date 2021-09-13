import { useState, MouseEvent } from "react"
import { Avatar, Button, Grid, IconButton, Popover, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { firestore, auth } from "../../firebase"
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';

const usarEstilos = makeStyles( theme => ({
	container: {
		padding: theme.spacing( 2, 2, 2, 2 )
	}, 
	marginTop1: {
		marginTop: theme.spacing(2)
	}
}))
interface CerrarSesionProps {
	idUsuario:string
}
export default function CerrarSesion({ idUsuario }: CerrarSesionProps) {
	const estilos = usarEstilos()

	const [ datosUsuario, cargando, error ] = useDocumentDataOnce<{ nombre:string, apellido:string, idUsuario:string, linkFotoDePerfil:string }>(firestore.doc(`usuarios/${idUsuario}`))

	const [ anchorElement, setAnchorElement ] = useState<HTMLButtonElement | null>(null)

	function abrirPopover(event: MouseEvent<HTMLButtonElement>) {
		setAnchorElement(event.currentTarget)
	}

	function cerrarSesion() {
		auth.signOut()
	}

	return (
		<Grid container justifyContent="flex-end" alignItems="center">
			<Grid item>
				<IconButton aria-describedby="menu-cerrar-sesion" onClick={abrirPopover}>
					<Avatar src={datosUsuario?.linkFotoDePerfil} />
				</IconButton>
				<Popover
					open={!!anchorElement}
					onClose={() => setAnchorElement(null)}
					anchorEl={anchorElement}
					anchorOrigin={{
				  	  vertical: 'bottom',
				  	  horizontal: 'left',
				  	}}
				  	transformOrigin={{
				  	  vertical: 'top',
				  	  horizontal: 'center',
				  	}}
				  	id="menu-cerrar-sesion"
				>
					<Grid container justifyContent="center" alignItems="center" direction="column" className={estilos.container}>
						<Grid item>
							<Typography align="center">
								{(datosUsuario?.nombre || "") + " " + (datosUsuario?.apellido || "")}
							</Typography>
						</Grid>
						<Grid item className={estilos.marginTop1}>
							<Button variant="contained" color="primary" onClick={cerrarSesion}>
								Cerrar sesión
							</Button>
						</Grid>
					</Grid>
				</Popover>
			</Grid>
		</Grid>
	)
}