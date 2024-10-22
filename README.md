
# Tienda de Productos APC

## Descripción
Aplicación web para la venta de productos electrónicos. Desarrollada con Flask en el backend y React en el frontend. El proyecto está diseñado para ejecutarse en localhost, ya que tuve problemas al subirlo a plataformas como Render, que marcaron mi cuenta como spam y no me lo han podido solucionar aún en ninguna página.

## Estructura del Proyecto

- **backend/**: Contiene el código del backend, manejado con Flask.
- **frontend/**: Contiene el código del frontend, manejado con React.
- **Tablas Mysql Workbench.rar**: Archivo que contiene las tablas de MySQL necesarias para el proyecto.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

- Python 3.x
- Node.js y npm
- MySQL

## Configuración del Backend

1. Navega a la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Activa el entorno virtual (venv):
   ```bash
   source .venv/bin/activate  # En Linux/macOS
   .venv\Scripts\activate      # En Windows
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Ejecuta la aplicación:
   ```bash
   python app.py
   ```

## Configuración del Frontend

1. Navega a la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el frontend:
   ```bash
   npm start
   ```

## Base de Datos MySQL

Los datos de conexión MySQL utilizados en el proyecto son los siguientes:
- `user`: `root`
- `password`: `2163`
- `host`: `127.0.0.1`
- `database`: `tienda_apc`

Las tablas necesarias están en el archivo `Tablas Mysql Workbench.rar`. Importa este archivo en MySQL Workbench antes de ejecutar la aplicación.

## Funcionalidades Adicionales

### 1. Añadir Productos desde un Archivo Excel
Para añadir productos a la página utilizando un archivo Excel, sigue estos pasos:

- En Postman, realiza una solicitud POST a `http://localhost:5000/api/importar_productos`.
- En el apartado `form-data`, selecciona `file` y sube el archivo Excel.

**Nota**: Antes de esto, asegúrate de iniciar sesión como administrador.

- Realiza un POST a `http://localhost:5000/api/login` y en el cuerpo de la solicitud (formato `raw`), envía un objeto con un usuario y contraseña de administrador.

### 2. Crear Usuario Administrador

Para asignar privilegios de administrador a un usuario, ejecuta esta consulta en MySQL:
```sql
UPDATE usuarios SET rol = 'admin' WHERE id = 1;
```

### 3. Añadir Variantes y Stock de Productos

Para añadir variantes y actualizar el stock de un producto, usa la siguiente consulta SQL:
```sql
INSERT INTO producto_variantes (producto_id, color, capacidad, stock)
VALUES
(1, 'Blanco', '256GB', 5),
(1, 'Negro', '128GB', 3) 
AS new
ON DUPLICATE KEY UPDATE stock = new.stock;
```

### 4. Guardar Imágenes de los Productos

Las imágenes de los productos deben guardarse en la ruta `backend/static/images`.

---

Si tienes algún problema al ejecutar el proyecto, revisa la configuración de tu entorno de desarrollo o consulta la documentación del proyecto.