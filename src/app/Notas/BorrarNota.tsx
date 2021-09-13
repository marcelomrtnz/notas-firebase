import firebase from "firebase/app"; 

import { useState } from "react"
import { Dialog, Button, CircularProgress, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { nota } from "./index"

interface BorrarNotaProps {
	//borrarNota: ( notaRef: firebase.firestore.DocumentReference<nota> ) => Promise<void>
	notaPorBorrar: null | firebase.firestore.DocumentReference<nota>
	setNotaPorBorrar: ( arg0:null ) => void
}
const usarEstilosBorrarNota = makeStyles( theme => ({
	espaciado: {
		margin: theme.spacing(3)
	},
	espaciadoBoton: {
		margin: theme.spacing(0, 3, 3, 3)
	}
}))
export default function BorrarNota({ notaPorBorrar, setNotaPorBorrar }: BorrarNotaProps) {
	const estilos = usarEstilosBorrarNota()

	const [ borrando, setBorrando ] = useState(false)

	async function onBorrar() {
		if ( !notaPorBorrar ) return;
		setBorrando(true)
		await notaPorBorrar.delete()
		setBorrando(false)
		setNotaPorBorrar(null)
	}

	return (
		<Dialog open={!!notaPorBorrar} onClose={() => setNotaPorBorrar(null)} >
			<header className={estilos.espaciado}>
				<Typography align="center">¿Querés borrar esta nota?</Typography>
			</header>
			<section className="d-flex align-items-center w-100">
				<Button 
					variant="contained"
					color="secondary"
					fullWidth 
					className={estilos.espaciadoBoton} 
					disabled={borrando} 
					onClick={onBorrar}>
						{ borrando?
							<CircularProgress />:
							"Sí"
						}
					</Button>
				<Button 
					variant="contained"
					color="primary"
					fullWidth 
					className={estilos.espaciadoBoton} 
					disabled={borrando} 
					onClick={() => setNotaPorBorrar(null)}>
						No
					</Button>
			</section>
		</Dialog>
	)
}