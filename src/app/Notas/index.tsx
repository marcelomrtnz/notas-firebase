import { useState, useMemo, useCallback } from "react"
import firebase from "firebase/app"; 
import { firestore, auth } from "../../firebase"
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';

import { Container, Divider, Grid, CircularProgress, IconButton, Typography } from "@material-ui/core"
import { Card, CardHeader, CardContent, CardActions } from "@material-ui/core"
import { Accordion, AccordionSummary, AccordionDetails } from "@material-ui/core"

import { makeStyles, createStyles } from "@material-ui/core/styles"
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PostAddIcon  from "@material-ui/icons/PostAdd"
import { PinIcon, PinOutlinedIcon } from "../../components/Icons"

import { CrearEditarNota as CrearNota, EditarNota } from "./CrearEditarNota"
import BorrarNota from "./BorrarNota"

import CerrarSesion from "../Sesion/CerrarSesion"

export type coloresDisponibles = "primary" | "secondary" | "warning" | "info" | "success"

export interface nota {
    id: string
    titulo: string,
    contenido: string,
    color: coloresDisponibles,
    fijado: boolean,
    updatedAt: firebase.firestore.Timestamp,
}

export interface contenidoNotaBasico {
    titulo: string,
    contenido: string,
    color: coloresDisponibles,
}

export const coloresDisponibles:coloresDisponibles[] = ["primary", "secondary", "warning", "info", "success"]

const usarEstilosNotas = makeStyles( theme => ({
	espaciado: {
		marginTop: theme.spacing(2)
	}
}))
export default function Notas() {
	const estilos = usarEstilosNotas()

	const [ usuario ] = useAuthState(auth)
	const notasCollectionRef = firestore.collection(`usuarios/${usuario?.uid}/notas`)
	const [ notas, cargando, _error ] = useCollection<nota>(notasCollectionRef)

	const [ creacionDeNotasAbierta, setCreacionDeNotaAbierta ] = useState(false)
	const [ notaPorEditar, setNotaPorEditar ] = useState<null | { contenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> }>(null)
	const [ notaPorBorrar, setNotaPorBorrar ] = useState<null | firebase.firestore.DocumentReference<nota>>(null)

	const crearNota = useCallback(async function crearNota(nuevaNota: contenidoNotaBasico) {
		await notasCollectionRef.add({
			...nuevaNota, 
			fijado: false,
			updatedAt: firebase.firestore.FieldValue.serverTimestamp()
		})
		setCreacionDeNotaAbierta(false)
	}, [ notasCollectionRef ])

	const editarNota = useCallback( async function editarNota( nuevoContenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> ) {
		await notaRef.update(nuevoContenidoNota)
		setNotaPorEditar(null)
	}, [])

	return (
		<Container component="main" className={"d-flex flex-column align-items-center justify-content-center w-100 h-100" }>
			{
				cargando?
				<Grid container justifyContent="center" className="h-100">
					<CircularProgress /> 
				</Grid>
				:
				<>
					{ usuario && <CerrarSesion idUsuario={usuario.uid}/> }
					<BorrarNota 
						notaPorBorrar={notaPorBorrar}
						setNotaPorBorrar={setNotaPorBorrar}
					/>
					<EditarNota 
						setNotaPorEditar={setNotaPorEditar} 
						notaPorEditar={notaPorEditar} 
						editarNota={editarNota} 
						crearNota={crearNota} 
					/>
					<Grid container justifyContent="center">
						<Grid item md={8} sm={12} className={"w-100 " + estilos.espaciado}>
							<Accordion expanded={creacionDeNotasAbierta} onChange={( _, abierta ) => setCreacionDeNotaAbierta(abierta)}>
								<AccordionSummary expandIcon={<PostAddIcon />}>
									Crear nota
								</AccordionSummary>
								<Divider />
								<AccordionDetails className="justify-content-center">
									<CrearNota editarNota={editarNota} crearNota={crearNota} />
								</AccordionDetails>
							</Accordion>
						</Grid>
					</Grid>
					<Grid container spacing={3} className={estilos.espaciado}>
						{notas && notas?.docs
							//cuando se agrega una nota, el timestamp se mantiene en null mientras no se reciba respuesta
							//del servidor.
							.sort( (notaA, notaB) => (notaB.get("updatedAt")?.toDate() || new Date()).getTime() - (notaA.get("updatedAt")?.toDate() || new Date()).getTime() )
							.sort( (notaA, notaB) => Number(notaB.get("fijado")) - Number(notaA.get("fijado")) )
							.map( nota => <Nota key={nota.id} nota={nota} setNotaPorEditar={setNotaPorEditar} setNotaPorBorrar={setNotaPorBorrar} /> )
						}
					</Grid>
				</>
			}
		</Container>
	)
}



const usarEstilosNota = makeStyles( theme => ({
	nota: {
		backgroundColor: (color: { colorSeleccionado: coloresDisponibles }) => (theme.palette[color.colorSeleccionado].main),
		color: (color: { colorSeleccionado: coloresDisponibles }) => theme.palette.background.default,
	}
}))

interface NotasProps {
	nota: firebase.firestore.QueryDocumentSnapshot<nota>,
	setNotaPorEditar: ( arg0:null | { contenidoNota: contenidoNotaBasico, notaRef: firebase.firestore.DocumentReference<nota> } ) => void
	setNotaPorBorrar: ( arg0: firebase.firestore.DocumentReference<nota> ) => void
}
function Nota({ nota, setNotaPorEditar, setNotaPorBorrar }: NotasProps) {
	const { titulo, contenido, color, fijado, updatedAt } = useMemo(() => nota.data(), [ nota ])

	const estilos = usarEstilosNota({ colorSeleccionado: color })

	//updatedAt puede ser null en los nuevos documentos
	const fechaFormateada = (!!updatedAt)? new Date(updatedAt.toDate()) : new Date()

	const [ fijandoNota, setFijandoNota ] = useState(false)
	async function fijarNota() {
		setFijandoNota(true)
		await nota.ref.update({ fijado: !fijado })
		setFijandoNota(false)
	}

	return (
		<Grid item xs={12} md={4}>
			<Card>
				<CardHeader
					className={estilos.nota + " word-wrap-anywhere"}
					title={titulo}
					subheader={fechaFormateada.toString()}
				/>
				<CardContent className="word-wrap-anywhere">
					<Typography >
						{contenido}
					</Typography>
				</CardContent>
				<CardActions className="justify-content-end">
					<IconButton onClick={() => setNotaPorEditar({ contenidoNota: { titulo, contenido, color }, notaRef: nota.ref })}>
						<EditIcon/>
					</IconButton>
					<IconButton onClick={() => setNotaPorBorrar(nota.ref)}>
						<DeleteIcon/>
					</IconButton>
					<IconButton onClick={() => fijarNota()}>
						{
							fijandoNota?
								<CircularProgress /> :
								fijado?
									<PinIcon />:
									<PinOutlinedIcon/>
						}
					</IconButton>
				</CardActions>
			</Card>
		</Grid>
	)
}