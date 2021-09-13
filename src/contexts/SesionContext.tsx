import { createContext, ReactNode } from "react"
import { useSnackbar } from "notistack"

import { auth, firestore } from "../firebase"
import { subirAStorage } from "../functions/archivos"

interface context {
	crearCuenta: ( email:string, clave:string, { 
	 		nombre, apellido, fotoDePerfil
	 	}: { nombre:string, apellido:string, fotoDePerfil:File | null }) => Promise<void>
}
export const sesionContext = createContext<context>(null!)

export function SesionContext({ children }: { children:ReactNode }) {
	const { enqueueSnackbar } = useSnackbar()

	//Automaticamente cuando se crea la cuenta se inicia sesion, por lo que 
	//se quita el componente CrearCuenta y no se sigue con la funcion. Asi que hay que ponerla en un context.
	async function crearCuenta( email:string, clave:string, { 
		nombre, apellido, fotoDePerfil
	}: { nombre:string, apellido:string, fotoDePerfil:File | null }) {
		const response = await auth.createUserWithEmailAndPassword( email, clave )
		//poner el nombre y el apellido, y la foto de perfil en Firestore
		if ( response?.user ) {
			let linkFotoDePerfil = ""
			console.log({ fotoDePerfil })
			if ( fotoDePerfil !== null ) {
				console.log("Hay foto de perfil")
				const nombreDeArchivo = fotoDePerfil.name
				const extension = nombreDeArchivo.substring(nombreDeArchivo.lastIndexOf('.') + 1, nombreDeArchivo.length)
				console.log(fotoDePerfil)
				linkFotoDePerfil = await subirAStorage(`/fotoDePerfil/${response.user.uid}.${extension}`, fotoDePerfil)
					.catch(() => {
						enqueueSnackbar("No se pudo subir la foto de perfil.", { variant: "error" })
						return ""
					})
				console.log("linkFotoDePerfil> " + linkFotoDePerfil)
			} 

			const informacionUsuarioCollectionRef = firestore.collection("/usuarios").doc(response.user.uid)

			await informacionUsuarioCollectionRef.set({
				nombre,
				apellido,
				idUsuario: response.user.uid,
				linkFotoDePerfil
			})
		}
	}

	return (
		<sesionContext.Provider
			value={{
				crearCuenta
			}}
		>
			{children}
		</sesionContext.Provider>
	)
}