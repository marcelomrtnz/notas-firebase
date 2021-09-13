import firebase from "firebase/app"; 

import { useState, SyntheticEvent } from "react"
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles"
import { Box, Dialog, Button, IconButton, TextField, CircularProgress } from "@material-ui/core"
import { useSnackbar } from "notistack"


import { nota, coloresDisponibles, contenidoNotaBasico } from "./index"

interface CrearEditarNotaProps {
	notaPorEditar?: { contenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> }
	editarNota: ( nuevoContenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> ) => Promise<void>
	crearNota: (nuevaNota: contenidoNotaBasico) => Promise<void>,
	classNameForm?: string
}

const usarEstilosCrear = makeStyles(( theme:Theme ) => createStyles({
	root: {
		"& .MuiTextField-root": {
			backgroundColor: theme.palette.background.default
		}, 
		"& .MuiButton-root": {
			backgroundColor: (color: { colorSeleccionado: coloresDisponibles }) => (theme.palette[color.colorSeleccionado].main),
			color: (color: { colorSeleccionado: coloresDisponibles }) => theme.palette.background.default
		}
	},
	textField: {
		marginTop: theme.spacing(2)
	},
	color: {
		height: theme.spacing(4),
		width: theme.spacing(4),
		borderRadius: "50%"
	}
}))
export function CrearEditarNota({ notaPorEditar, crearNota, editarNota, classNameForm = "" }: CrearEditarNotaProps) {
	const { enqueueSnackbar } = useSnackbar()
	const [ colorSeleccionado, setColorSeleccionado ] = useState<coloresDisponibles>(notaPorEditar?.contenidoNota.color || "primary")
	const estilos = usarEstilosCrear({ colorSeleccionado })

	const [ cargando, setCargando ] = useState(false)

	async function onSubmit(e:SyntheticEvent) {
		e.preventDefault()
		const target = e.target as typeof e.target & {
			titulo: { value: string }, 
			contenido: { value: string }
		}

		const titulo = target.titulo.value
		const contenido = target.contenido.value

		if ( !titulo ) return enqueueSnackbar("Debe tener un título.", { variant: "error" })

		setCargando(true)

		if ( !notaPorEditar ) await crearNota({ titulo, contenido, color: colorSeleccionado })
		else await editarNota({ titulo, contenido, color: colorSeleccionado }, notaPorEditar.notaRef)

		setCargando(false)
	}

	return (
		<form onSubmit={onSubmit} className={`${estilos.root} ${classNameForm}`}>
			<TextField
				required
				defaultValue={notaPorEditar?.contenidoNota.titulo || ""}
				className={estilos.textField}
				disabled={cargando}
				autoFocus
				fullWidth
				variant="outlined"
				label="Título"
				name="titulo"
			/>
			<TextField
				required
				defaultValue={notaPorEditar?.contenidoNota.contenido || ""}
				className={estilos.textField}
				disabled={cargando}
				fullWidth
				variant="outlined"
				multiline
				minRows={4}
				maxRows={12}
				label="Contenido"
				name="contenido"
			/>
			<ul className={"d-flex align-items-center justify-content-around w-100 " + estilos.textField}>
				{coloresDisponibles.map( color =>
					<IconButton onClick={() => setColorSeleccionado(color)} key={color}>
						<Box component="span" bgcolor={color + ".main"} className={estilos.color}/>
					</IconButton>
				)}
			</ul>
			<Button 
				fullWidth	
				type="submit"
				variant="contained"
				disabled={cargando}
			>
				{	cargando?
					<CircularProgress />:
						!!notaPorEditar?
						"Editar" :
						"Agregar"	
				}
			</Button>
		</form>
	)
}

interface EditarNotaProps {
	notaPorEditar?: null | { contenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> }
	setNotaPorEditar: ( arg0: null ) => void
	editarNota: ( nuevoContenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> ) => Promise<void>
	crearNota: (nuevaNota: contenidoNotaBasico) => Promise<void>
}
const usarEstilosEditar = makeStyles( theme => ({
	padding: {
		padding: theme.spacing(2, 2, 2, 2)
	}
}))
export function EditarNota({ notaPorEditar, setNotaPorEditar, editarNota, crearNota }: EditarNotaProps) {
	const estilos = usarEstilosEditar()

	return (
		<Dialog open={!!notaPorEditar} onClose={() => setNotaPorEditar(null)} >
			{notaPorEditar && <CrearEditarNota notaPorEditar={notaPorEditar} editarNota={editarNota} crearNota={crearNota} classNameForm={estilos.padding}/>}
		</Dialog>
	)
}
