# scram_1
----------
# directorios:
# config
    - se usa el modulo passport y sus estrategias para el manejo del toker para la authentication
# database
    - se encuentra los archivos que se usaran para la coneccion de la base de datos
# models (en este directorio estan ubicados los modelos)
    -cita
    -dependiente
    -doctor
    -especialidad
    -horario
    -organizacion
    -user
# controller(se encuentran las funcionalidades para los endpoints)
    - se realizan las funcionalidades que son usadas en la api. 
# routes:
    - se encuentra la carpeta api donde se enucentran los siguientes archivos que usaran el enrutador
      de express para usar los metodos de los controlodares para cada respectivo endpoint:
        *   indexusr    (rutas para user)
        *   indexdct    (rutas para doctor)
        *   indexorg    (rutas para organizacion)
# tools:
    - se encuentra el archivo scrapper.js:
        *este archvivo usa el modulo puppeter que sirve para hacer el scrapping a la pagina -> "https://www.cmp.org.pe/conoce-a-tu-medico"
# ENDPOINTS  :
-------------------
# user(doctor) -------------------------------------
 # crera un nuevo doctor REGISTANDOTE
    http://localhost:3000/api/signupdoctor
 # LOGEARTE una vez ya tengas tu CUENTA REGISTRADA  (devuelve token)
    http://localhost:3000/api/signindoctor  
 # salir de la cuenta del doctor   (autorizado con token)
    http://localhost:3000/api/signoutdoctor
 # mostrar datos del doctor  para su perfil  logeados   (autorizado con token)
    http://localhost:3000/api/doctor/perfil/:id
 # actualizar datos del doctor logeado  (autorizado con token)
    http://localhost:3000/api/doctor/perfil/update

# user(paciente) -------------------------------------
 # crera un nuevo usuario REGISTANDOTE
    http://localhost:3000/api/signupuser
 # LOGEARTE una vez ya tengas tu CUENTA REGISTRADA  (devuelve token)
    http://localhost:3000/api/signinuser  
 # Salir de tu cuenta   (autorizado con token)
    http://localhost:3000/api/signoutuser
 # crear nueva cita una vez logeado  (autorizado con token)
    http://localhost:3000/api/user/nuevacita
 # obtener datos del usuario logeado  (autorizado con token)
    http://localhost:3000/api/user/perfil/:id
 # actualizar los datos del usuario logeado  (autorizado con token) 
    http://localhost:3000/api/user/perfil/update/:id
 # agregar nuevo dependiente  (autorizado con token) 
    http://localhost:3000/api/user/dependiente/agregar/:id
 # listar dependientes (autorizado con token) 
    http://localhost:3000/api/user/dependiente/listar/:id

# user(Organizacion) -------------------------------------
 # crera una nueva organizacion REGISTANDOTE
    http://localhost:3000/api/signuporganizacion
 # LOGEARTE una vez ya tengas tu CUENTA REGISTRADA  (devuelve token)
    http://localhost:3000/api/signinorganizacion 
 # Salir de tu cuenta   (autorizado con token)
    http://localhost:3000/api/signoutorganizacion
 # obtener datos del usuario logeado para su perfil (autorizado con token)
    http://localhost:3000/api/organizacion/perfil/:id
 # actualizar datos de la organizacion  (autorizado con token)
    http://localhost:3000/api/organizacion/perfil/update/:id
    

# especialidad---------------------------------
 # cargar las primeras especialidades a la base de datos (solo lo usamos unica vez para cargar la data especialidad)
    http://localhost:3000/cargarespecialidad
 # obtener las especialidades  
    http://localhost:3000/especialidad
 # obtener especialidades por doctor
    http://localhost:3000/especialidad/doctores

--
# NOTA: solo los endpoints descritos que tienen en la parte derecha este mensaje -> "(autorizados con token)"  significa que usan el token del usuario.
--