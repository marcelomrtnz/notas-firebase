import { storage } from "../firebase"

export async function filesToBase64( archivos: FileList ) {
	const promiseLeerArchivos = Array.from( archivos ).map( ( archivo ):Promise<string> => 
		new Promise(( resolve, reject ) => {
			const reader = new FileReader()
			reader.readAsDataURL( archivo )
			reader.onload = async function() {
				if ( typeof reader.result === "string" ) resolve(reader.result)
			}
			reader.onerror = reject
		})
	)

	const archivosLeidos:string[] = await Promise.all( promiseLeerArchivos )
	
	return archivosLeidos
}

export function subirAStorage(ubicacion:string, fotoDePerfil:File):Promise<string> {
	return new Promise(( resolve, reject ) => {
		const uploadObserver = storage.ref(ubicacion).put(fotoDePerfil)
		console.log("Subiendo...")
		uploadObserver.on("state_changed", {
			complete() {
				console.log("Subida")
				uploadObserver.snapshot.ref.getDownloadURL()
				.then(resolve)
				.catch(reject)
			},
			error() {
				reject()
			}
		})
	})
}