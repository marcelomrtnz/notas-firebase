import { useState, useEffect, useCallback, useMemo, useContext, SyntheticEvent, ChangeEvent } from "react"
import { Avatar, Badge, Button, Container, Divider, Grid, IconButton, Paper, Typography, TextField } from "@material-ui/core"
import { Link } from "react-router-dom"
import { filesToBase64, subirAStorage } from "../../functions/archivos"
import { makeStyles, Theme } from "@material-ui/core/styles"
import { useSnackbar } from "notistack"

import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined';

import { auth, firestore, storage } from "../../firebase"
import { sesionContext } from "../../contexts/SesionContext"

const useStyles = makeStyles(( theme:Theme ) => 
	({
    	textfields: {
    	    padding: theme.spacing(1.2),
    	},
		espaciado: {
			marginTop: theme.spacing(1.5),
			marginBottom: theme.spacing(1.5)
		},
		barra: {
			borderColor: theme.palette.divider, //palette.divider
			backgroundColor: theme.palette.background.paper
		}
	})
)
export default function CrearCuenta() {
	const { crearCuenta } = useContext(sesionContext)

	const { enqueueSnackbar } = useSnackbar()
	const estilos = useStyles()

	const informacionUsuarioCollectionRef = firestore.collection("usuarios")

	const [ cargando, setCargando ] = useState(false)
	const [ claveVisible, setClaveVisible ] = useState(false)

	const [ fortalezaDeClave, setFortalezaDeClave ] = useState(0)

	function onClaveChange( e: any ) {
		e.stopPropagation()
		const claveIngresada = e.target.value
		if ( claveIngresada.length === 0 ) setFortalezaDeClave(0)
		const nuevaFortaleza = 1 +
			+(claveIngresada.length > 5) +
        	+(claveIngresada.search(/[A-Z]/) > -1) +
        	+(claveIngresada.search(/[0-9]/) > -1) +
			+(claveIngresada.search(/[$&+,:;=?@*#]/) > -1)

		if ( nuevaFortaleza === fortalezaDeClave ) return

		setFortalezaDeClave(nuevaFortaleza)
	}

	const VisibilizarClave = useMemo(() => (
		<IconButton onClick={() => setClaveVisible(!claveVisible)}>
			{claveVisible ? 
				<VisibilityIcon /> : 
				<VisibilityOffIcon />
			}
		</IconButton>
	), [claveVisible])

	const [ fotoDePerfil, setFotoDePerfil ] = useState<{src: string, file: null | File}>({ src: "", file: null })
	async function subirFotoDePerfil( e: ChangeEvent<HTMLInputElement> ) {
		try {
			console.log(e.target.files)
			if ( !e.target.files ) return
			const archivos = await filesToBase64( e.target.files )
			if ( !archivos[0] || !e.target.files[0]) return;
			setFotoDePerfil({ src: archivos[0], file: e.target.files[0] })
		}
		catch ( error ) {
			enqueueSnackbar("Ocurrió un error al subir la foto de perfil.", { variant: "error" })
		}
	}
	function activarInputDeFotoPerfil() {
		document.getElementById("subirFotoDePerfil")?.click()
	}



	const registrarse = useCallback( async (e:SyntheticEvent) => {
		e.preventDefault()
		const target = e.target as typeof e.target & {
			nombre: { value: string }
			apellido: { value: string }
			correo: { value: string }
			clave: { value: string }
			confirmarClave: { value: string }
		}

		const nombre = target.nombre.value
		const apellido = target.apellido.value
		const email = target.correo.value
		const clave = target.clave.value
		const confirmarClave = target.confirmarClave.value

		if ( clave.length < 6 ) return enqueueSnackbar("La contraseña debe tener al menos 6 caracteres.", { variant: "error" })
		if ( clave !== confirmarClave ) return enqueueSnackbar("Las contraseñas no coinciden.", { variant: "error" })

		setCargando(true)
		try {
			await crearCuenta( email, clave, {
				nombre,
				apellido,
				fotoDePerfil: fotoDePerfil?.file 
			})
		}
		catch ( error ) {
			console.log(error)
			enqueueSnackbar("Ocurrió un error al registrarse. Probablemente este correo ya fue registrado.", { variant: "error" })
			setCargando(false)
		} 
	}, [ fotoDePerfil ])
	
	return (
		<Container maxWidth="sm" component="main" className="d-flex justify-content-center" >
			<input type="file" accept="image/*" id="subirFotoDePerfil" className="d-none" onChange={subirFotoDePerfil} />
			<header className={estilos.textfields}>
				<Typography >
					Registrarse
				</Typography>
			</header>
			<Divider/>
			<section className={"d-flex justify-content-center align-items-center " + estilos.espaciado}>
				<IconButton onClick={activarInputDeFotoPerfil} className="p-0">
					<Avatar src={fotoDePerfil.src} style={{ width: "8rem", height: "8rem" }} />
				</IconButton>
			</section>
			<form onSubmit={registrarse} className={estilos.espaciado}>
				<Grid container wrap="wrap">
					<Grid item xs={12} sm={6} className={estilos.textfields}>
						<TextField
							fullWidth
							name="nombre"
							required
							autoFocus
							label="Nombre"
							variant="outlined"
						/>
					</Grid>
					<Grid item xs={12} sm={6} className={estilos.textfields}>
						<TextField
							fullWidth
							name="apellido"
							required
							label="Apellido"
							variant="outlined"
						/>
					</Grid>
				</Grid>
				<section className={estilos.textfields}>
					<TextField
						type="email"
						name="correo"
						fullWidth
						required
						label="Correo"
						variant="outlined"
					/>
				</section>
				<Grid container wrap="wrap" >
					<Grid item xs={12} sm={6} className={estilos.textfields} >
						<TextField
							required
							fullWidth
							name="clave"
							label="Contraseña"
							variant="outlined"
							onChange={onClaveChange}
							autoComplete="new-password"
							type={!claveVisible? "password" : "text"}
							InputProps={{
								endAdornment: VisibilizarClave
							}}
						/>
					</Grid>
					<Grid item xs={12} sm={6} className={estilos.textfields} >
						<TextField
							required
							fullWidth
							type="password"
							variant="outlined"
							id="confirm-password"
							name="confirmarClave"
							autoComplete="new-password"
							label="Confirmar contraseña"
						/>
					</Grid>
				</Grid>
				<section className={"strength " + estilos.textfields}>
                    <span className={ "bar border " + estilos.barra + (fortalezaDeClave > 0 ? " bar-1 " : "") } />
                    <span className={ "bar border " + estilos.barra + (fortalezaDeClave > 1 ? " bar-2 " : "") } />
                    <span className={ "bar border " + estilos.barra + (fortalezaDeClave > 2 ? " bar-3 " : "") } />
                    <span className={ "bar border " + estilos.barra + (fortalezaDeClave > 3 ? " bar-4 " : "") } />
                </section>
				<Button 
					className={estilos.espaciado}
					size="large" 
					variant="contained" 
					type="submit" 
					fullWidth
					color="primary"
				>
					Registrarse
				</Button>
			</form>
		</Container>
	)
}