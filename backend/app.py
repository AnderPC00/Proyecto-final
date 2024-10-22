from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

app = Flask(__name__)

app.secret_key = '2163'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = '2163'
app.config['SESSION_PERMANENT'] = False
Session(app)
CORS(app, supports_credentials=True)

# Configuración de Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Crear un modelo de usuario
class User(UserMixin):
    def __init__(self, id):
        self.id = id
        # Puedes agregar más atributos si es necesario, por ejemplo, username, email, etc.

    def get_id(self):
        return str(self.id)

    @property
    def is_authenticated(self):
        # Devuelve True siempre que el ID del usuario esté presente
        return self.id is not None

@login_manager.user_loader
def load_user(user_id):
    cnx = get_db_connection()  # Asegúrate de que estás usando la función correcta para obtener la conexión a la base de datos
    cursor = cnx.cursor(dictionary=True)
    
    # Consultar la base de datos para obtener la información del usuario
    cursor.execute('SELECT * FROM usuarios WHERE id = %s', (user_id,))
    user_data = cursor.fetchone()
    cnx.close()

    if user_data:
        # Retornar el objeto User con los datos del usuario autenticado
        return User(user_data['id'])
    return None

# Configuración de la conexión a la base de datos MySQL
config = {
    'user': 'root',
    'password': '2163',
    'host': '127.0.0.1',
    'database': 'tienda_apc'
}

def get_db_connection():
    connection = mysql.connector.connect(
        host=config['host'],
        user=config['user'],
        password=config['password'],
        database=config['database']
    )
    return connection

def guardar_carrito_usuario(user_id, carrito):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM user_cart WHERE user_id = %s', (user_id,))
    for producto_id, cantidad in carrito.items():
        cursor.execute('INSERT INTO user_cart (user_id, producto_id, cantidad) VALUES (%s, %s, %s)', (user_id, producto_id, cantidad))
    conn.commit()
    cursor.close()
    conn.close()

def cargar_carrito_usuario(user_id):
    conn = None
    try:
        conn = get_db_connection()  # Conexión a la base de datos
        cursor = conn.cursor(dictionary=True)

        # Obtener los productos y cantidades del carrito del usuario
        cursor.execute('SELECT producto_id, cantidad FROM user_cart WHERE user_id = %s', (user_id,))
        carrito = {str(item['producto_id']): item['cantidad'] for item in cursor.fetchall()}

        return carrito if carrito else {}

    except Exception as e:
        print(f"Error al cargar el carrito del usuario {user_id}: {e}")
        return {}

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/check_session', methods=['GET'])
def check_session():
    if current_user.is_authenticated:
        return jsonify({
            "_fresh": current_user.is_authenticated,
            "cart": session.get('cart', {})
        })
    else:
        return jsonify({
            "_fresh": False,
            "cart": session.get('cart', {})
        })

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/api/check_session', methods=['GET'])
def api_check_session():
    return jsonify(session)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT id, password FROM usuarios WHERE username = %s', (username,))
        user = cursor.fetchone()
        if user and check_password_hash(user['password'], password):
            login_user(User(user['id']))
            session['cart'] = cargar_carrito_usuario(user['id'])
            session.modified = True
            flash('Sesión iniciada correctamente.', 'success')
            cnx.close()
            return redirect(url_for('profile'))
        cnx.close()
        flash('Usuario o contraseña incorrectos', 'danger')
        return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)
    
    # Verificar si el usuario existe en la base de datos
    cursor.execute('SELECT id, password FROM usuarios WHERE username = %s', (username,))
    user = cursor.fetchone()
    
    if user and check_password_hash(user['password'], password):
        # Crear el objeto de usuario para Flask-Login
        usuario_obj = User(user['id'])
        login_user(usuario_obj)  # Iniciar la sesión del usuario

        # Cargar el carrito del usuario después de iniciar sesión
        carrito_usuario = cargar_carrito_usuario(user['id'])
        if carrito_usuario:
            session['cart'] = carrito_usuario  # Guardar el carrito del usuario en la sesión
        else:
            session['cart'] = []  # Si no hay carrito guardado, iniciar uno vacío

        session.modified = True  # Asegurar que Flask sepa que la sesión ha sido modificada

        # Cerrar la conexión a la base de datos
        cnx.close()
        
        return jsonify({'message': 'Sesión iniciada correctamente'}), 200
    
    cnx.close()
    return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401

@app.route('/logout')
@login_required
def logout():
    if 'cart' in session:
        guardar_carrito_usuario(current_user.id, session['cart'])
    session.pop('cart', None)
    session.modified = True
    logout_user()
    flash('Has cerrado sesión.', 'info')
    return redirect(url_for('home'))

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    if 'cart' in session:
        # Guardar el carrito en la base de datos si es necesario
        guardar_carrito_usuario(current_user.id, session['cart'])
    
    # Vaciar el carrito y cerrar sesión
    session.pop('cart', None)
    session.modified = True  # Asegurar que Flask sepa que la sesión ha sido modificada
    logout_user()
    
    return jsonify({'message': 'Cierre de sesión exitoso'})

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)
        cnx = get_db_connection()
        cursor = cnx.cursor()
        try:
            cursor.execute('INSERT INTO usuarios (username, password) VALUES (%s, %s)', (username, hashed_password))
            cnx.commit()
            flash('Usuario registrado correctamente', 'success')
            return redirect(url_for('login'))
        except mysql.connector.Error as err:
            cnx.rollback()
            flash(f"Error: {err}", 'danger')
        finally:
            cursor.close()
            cnx.close()
    return render_template('register.html')

@app.route('/productos')
def productos():
    try:
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT * FROM productos')
        productos = cursor.fetchall()
        cursor.close()
        cnx.close()
        return render_template('productos.html', productos=productos)
    except mysql.connector.Error as err:
        flash(f"Error: {err}", 'danger')
        return redirect(url_for('home'))

@app.route('/api/productos', methods=['GET'])
def api_productos():
    try:
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT id, nombre, precio, stock FROM productos') 
        productos = cursor.fetchall()
        cursor.close()
        cnx.close()
        return jsonify(productos)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    
@app.route('/api/productos_destacados', methods=['GET'])
def obtener_productos_destacados():
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute('SELECT * FROM productos LIMIT 5') 
    productos = cursor.fetchall()
    cnx.close()
    return jsonify(productos)

@app.route('/add_to_cart/<int:producto_id>', methods=['POST'])
def add_to_cart(producto_id):
    cantidad = request.form.get('cantidad', 1, type=int)
    if 'cart' not in session:
        session['cart'] = {}
    cart = session['cart']
    
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute('SELECT stock FROM productos WHERE id = %s', (producto_id,))
    producto = cursor.fetchone()
    
    cantidad_total = cart.get(str(producto_id), 0) + cantidad
    if cantidad_total > producto['stock']:
        flash(f"No puedes añadir más de {producto['stock']} productos al carrito.", 'error')
        cnx.close()
        return redirect(url_for('productos'))
    
    cart[str(producto_id)] = cantidad_total
    
    # Si el usuario está autenticado, guarda el carrito en la base de datos
    if current_user.is_authenticated:
        cursor.execute('SELECT cantidad FROM user_cart WHERE user_id = %s AND producto_id = %s', (current_user.id, producto_id))
        result = cursor.fetchone()
        if result:
            nueva_cantidad = result['cantidad'] + cantidad
            cursor.execute('UPDATE user_cart SET cantidad = %s WHERE user_id = %s AND producto_id = %s', (nueva_cantidad, current_user.id, producto_id))
        else:
            cursor.execute('INSERT INTO user_cart (user_id, producto_id, cantidad) VALUES (%s, %s, %s)', (current_user.id, producto_id, cantidad))
        cnx.commit()
    
    cnx.close()
    session['cart'] = cart
    session.modified = True
    flash('Producto añadido al carrito con éxito.', 'success')
    return redirect(url_for('carrito'))

@app.route('/api/add_to_cart/<int:producto_id>', methods=['POST'])
def api_add_to_cart(producto_id):
    data = request.get_json()
    cantidad = data.get('cantidad', 1)
    if 'cart' not in session:
        session['cart'] = {}
    cart = session['cart']
    
    # Verificar stock en la base de datos
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute('SELECT stock FROM productos WHERE id = %s', (producto_id,))
    producto = cursor.fetchone()
    
    if producto:
        cantidad_total = cart.get(str(producto_id), 0) + cantidad
        if cantidad_total > producto['stock']:
            cnx.close()
            return jsonify({"message": "No puedes añadir más productos de los que hay en stock"}), 400

        cart[str(producto_id)] = cantidad_total
        session['cart'] = cart
        session.modified = True

        # Si el usuario está autenticado, guarda el carrito en la base de datos
        if current_user.is_authenticated:
            guardar_carrito_usuario(current_user.id, session['cart'])

        cnx.close()
        return jsonify({"message": "Producto añadido al carrito con éxito"}), 200
    else:
        cnx.close()
        return jsonify({"message": "Producto no encontrado"}), 404

@app.route('/carrito')
def carrito():
    if 'cart' not in session:
        session['cart'] = {}
    cart = session['cart']
    productos_con_cantidades = []
    total = 0
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    producto_ids = list(cart.keys())
    
    if producto_ids:
        cursor.execute('SELECT * FROM productos WHERE id IN (%s)' % ','.join(['%s'] * len(producto_ids)), producto_ids)
        productos = cursor.fetchall()
        
        for producto in productos:
            producto_id = producto['id']
            cantidad = cart.get(str(producto_id), 0)
            total += producto['precio'] * cantidad
            productos_con_cantidades.append({**producto, 'cantidad': cantidad})
    
    conn.close()
    return render_template('carrito.html', productos=productos_con_cantidades, total=total)

@app.route('/api/carrito', methods=['GET'])
def api_carrito():
    if 'cart' not in session:
        session['cart'] = {}
    cart = session['cart']
    productos_con_cantidades = []
    total = 0

    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    if cart:
        producto_ids = list(cart.keys())
        cursor.execute('SELECT id, nombre, precio, stock FROM productos WHERE id IN (%s)' % ','.join(['%s'] * len(producto_ids)), producto_ids)
        productos = cursor.fetchall()

        for producto in productos:
            producto_id = str(producto['id'])
            cantidad = cart.get(producto_id, 0)
            total += producto['precio'] * cantidad
            productos_con_cantidades.append({
                'id': producto['id'],
                'nombre': producto['nombre'],
                'precio': producto['precio'],
                'cantidad': cantidad,
                'stock': producto['stock']
            })

    cnx.close()
    return jsonify({"productos": productos_con_cantidades, "total": total})

@app.route('/remove_from_cart/<int:producto_id>', methods=['POST'])
def remove_from_cart(producto_id):
    if 'cart' in session:
        cart = session['cart']
        if str(producto_id) in cart:
            del cart[str(producto_id)]
        if current_user.is_authenticated:
            cnx = get_db_connection()
            cursor = cnx.cursor()
            cursor.execute('DELETE FROM user_cart WHERE user_id = %s AND producto_id = %s', (current_user.id, producto_id))
            cnx.commit()
            cnx.close()
        session['cart'] = cart
        flash('Producto eliminado del carrito', 'info')
    return redirect(url_for('carrito'))

@app.route('/api/remove_from_cart/<int:producto_id>', methods=['POST'])
def api_remove_from_cart(producto_id):
    if 'cart' in session:
        cart = session['cart']
        if str(producto_id) in cart:
            del cart[str(producto_id)]
            session['cart'] = cart
            return jsonify({'message': 'Producto eliminado correctamente'}), 200
        else:
            return jsonify({'error': 'Producto no encontrado en el carrito'}), 404
    return jsonify({'error': 'Carrito no encontrado'}), 400

@app.route('/update_cart/<int:producto_id>', methods=['POST'])
def update_cart(producto_id):
    if 'cart' in session:
        cart = session['cart']
        nueva_cantidad = request.form.get('cantidad', type=int)

        # Comprueba si la cantidad es válida
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT stock FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        cnx.close()

        if producto:
            # Valida que la nueva cantidad no supere el stock
            if nueva_cantidad <= producto['stock']:
                print(f'Actualizando producto {producto_id} a {nueva_cantidad} unidades')
                cart[str(producto_id)] = nueva_cantidad
                session['cart'] = cart  # Asegura que la sesión se actualiza

                # Si el usuario está autenticado, también se actualiza en la base de datos
                if current_user.is_authenticated:
                    cnx = get_db_connection()
                    cursor = cnx.cursor()
                    cursor.execute(
                        'UPDATE user_cart SET cantidad = %s WHERE user_id = %s AND producto_id = %s',
                        (nueva_cantidad, current_user.id, producto_id)
                    )
                    cnx.commit()
                    cnx.close()

                flash('Cantidad actualizada correctamente.', 'success')
            else:
                flash(f'No puedes añadir más de {producto["stock"]} unidades al carrito.', 'error')
        else:
            flash('Producto no encontrado.', 'error')

    return redirect(url_for('carrito'))

@app.route('/api/update_cart/<int:producto_id>', methods=['POST'])
def api_update_cart(producto_id):
    data = request.get_json()  # Asegurarse de que se está recibiendo JSON
    nueva_cantidad = data.get('cantidad')

    if nueva_cantidad is None or nueva_cantidad < 1:
        return jsonify({'error': 'Cantidad inválida'}), 400

    if 'cart' not in session:
        return jsonify({'error': 'Carrito no encontrado'}), 400

    cart = session['cart']
    if str(producto_id) in cart:
        cart[str(producto_id)] = nueva_cantidad
        session['cart'] = cart
        return jsonify({'message': 'Cantidad actualizada correctamente'}), 200
    else:
        return jsonify({'error': 'Producto no encontrado en el carrito'}), 404

@app.route('/api/checkout', methods=['POST'])
def api_checkout():
    data = request.get_json()
    direccion = data.get('direccion', {}).get('direccion', '')
    telefono = data.get('telefono', '')
    ciudad = data.get('direccion', {}).get('ciudad', '')
    provincia = data.get('direccion', {}).get('provincia', '')
    codigo_postal = data.get('direccion', {}).get('codigo_postal', '')
    pais = data.get('direccion', {}).get('pais', '')
    metodo_pago = data.get('metodo_pago', '')

    print('Datos recibidos:', data)

    if not direccion or not telefono or not metodo_pago:
        return jsonify({'error': 'Falta información de dirección, teléfono o método de pago'}), 400

    # Obtener carrito de la sesión
    if 'cart' not in session or not session['cart']:
        return jsonify({'message': 'El carrito está vacío'}), 400

    cart = session['cart']
    total = 0
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    # Calcular el total del carrito y verificar stock
    for producto_id, cantidad in cart.items():
        cursor.execute('SELECT precio, stock FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        if producto:
            if producto['stock'] < cantidad:
                cnx.close()
                return jsonify({'message': f"No hay suficiente stock para {producto['nombre']}."}), 400
            total += producto['precio'] * cantidad

    # Verificar si el usuario está autenticado
    if current_user.is_authenticated:
        print(f'Usuario autenticado: {current_user.is_authenticated}, ID: {current_user.id}')

        # Verificar si la dirección ya existe
        cursor.execute('SELECT id FROM direcciones WHERE user_id = %s AND direccion = %s AND telefono = %s',
                       (current_user.id, direccion, telefono))
        direccion_existente = cursor.fetchone()

        if not direccion_existente:
            print(f'Insertando dirección para el usuario {current_user.id}: {direccion}, {telefono}')
            cursor.execute('INSERT INTO direcciones (user_id, direccion, telefono, ciudad, provincia, codigo_postal, pais) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                           (current_user.id, direccion, telefono, ciudad, provincia, codigo_postal, pais))
            direccion_id = cursor.lastrowid
        else:
            direccion_id = direccion_existente['id']

        cursor.execute('INSERT INTO pedidos (user_id, total, direccion_id, metodo_pago) VALUES (%s, %s, %s, %s)',
                       (current_user.id, total, direccion_id, metodo_pago))
        pedido_id = cursor.lastrowid

        for producto_id, cantidad in cart.items():
            cursor.execute('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (%s, %s, %s, %s)',
                           (pedido_id, producto_id, cantidad, producto['precio']))

    else:
        print('Usuario no autenticado, guardando dirección temporal.')
        direccion_temporal = data.get('direccion', {}).get('direccion', '')
        telefono_temporal = data.get('telefono', '')

        if not direccion_temporal or not telefono_temporal:
            return jsonify({'error': 'Falta información de dirección o teléfono para usuarios no autenticados'}), 400

        cursor.execute('INSERT INTO pedidos (total, direccion_temporal, telefono_temporal, metodo_pago) VALUES (%s, %s, %s, %s)',
                       (total, direccion_temporal, telefono_temporal, metodo_pago))
        pedido_id = cursor.lastrowid

        for producto_id, cantidad in cart.items():
            cursor.execute('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (%s, %s, %s, %s)',
                           (pedido_id, producto_id, cantidad, producto['precio']))

    for producto_id, cantidad in cart.items():
        cursor.execute('UPDATE productos SET stock = stock - %s WHERE id = %s', (cantidad, producto_id))

    cnx.commit()
    cnx.close()

    session.pop('cart', None)

    return jsonify({'message': 'Pago realizado con éxito', 'total': total}), 200

@app.route('/historial')
@login_required
def historial():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Obtener los pedidos del usuario
    cursor.execute('SELECT * FROM pedidos WHERE user_id = %s', (current_user.id,))
    pedidos = cursor.fetchall()

    # Obtener los detalles de cada pedido
    for pedido in pedidos:
        cursor.execute('SELECT p.nombre, dp.cantidad, dp.precio FROM detalles_pedido dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = %s', 
                       (pedido['id'],))
        pedido['detalles'] = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('historial.html', pedidos=pedidos)

@app.route('/api/buscar_productos', methods=['GET'])
def buscar_productos():
    query = request.args.get('q', '')  # Obtener el parámetro de búsqueda 'q'
    
    # Conectar a la base de datos
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)
    
    # Buscar productos que coincidan con el nombre o descripción
    cursor.execute("SELECT * FROM productos WHERE nombre LIKE %s OR descripcion LIKE %s", 
                   ('%' + query + '%', '%' + query + '%'))
    
    productos = cursor.fetchall()
    cursor.close()
    cnx.close()
    
    return jsonify(productos)

@app.route('/api/guardar_direccion', methods=['POST'])
@login_required
def guardar_direccion():
    data = request.get_json()
    direccion = data.get('direccion')
    ciudad = data.get('ciudad')
    provincia = data.get('provincia')
    codigo_postal = data.get('codigo_postal')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO direcciones (user_id, direccion, ciudad, provincia, codigo_postal) VALUES (%s, %s, %s, %s, %s)',
        (current_user.id, direccion, ciudad, provincia, codigo_postal)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Dirección guardada con éxito'})

@app.route('/api/obtener_direcciones', methods=['GET'])
def obtener_direcciones():
    user_id = current_user.id if current_user.is_authenticated else None

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if user_id:
        # Si el usuario está autenticado, buscar direcciones asociadas a su ID
        cursor.execute('SELECT direccion, ciudad, provincia, codigo_postal, pais, telefono FROM direcciones WHERE user_id = %s', (user_id,))
    else:
        # Si no está autenticado, devolvemos una lista vacía de direcciones
        return jsonify([]), 200

    direcciones = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(direcciones), 200

@app.route('/api/procesar_pago', methods=['POST'])
@login_required
def procesar_pago():
    data = request.get_json()
    metodo_pago = data.get('metodo_pago')
    direccion_id = data.get('direccion_id')
    total = data.get('total')

    # Aquí procesar el pago real, por ejemplo, con PayPal o Apple Pay

    # Simulación del proceso de pago
    if metodo_pago not in ['Apple Pay', 'PayPal', 'Tarjeta de Crédito']:
        return jsonify({'error': 'Método de pago no válido'}), 400

    return jsonify({'message': 'Pago procesado con éxito'})

@app.route('/api/historial_pedidos', methods=['GET'])
@login_required
def historial_pedidos():
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    # Obtener los pedidos del usuario autenticado
    cursor.execute('SELECT * FROM pedidos WHERE user_id = %s ORDER BY fecha DESC', (current_user.id,))
    pedidos = cursor.fetchall()

    # Obtener los detalles de cada pedido
    for pedido in pedidos:
        cursor.execute('SELECT dp.producto_id, p.nombre, dp.cantidad, dp.precio FROM detalles_pedido dp JOIN productos p ON dp.producto_id = p.id WHERE dp.pedido_id = %s', 
                       (pedido['id'],))
        pedido['detalles'] = cursor.fetchall()

    cursor.close()
    cnx.close()

    return jsonify(pedidos)


if __name__ == '__main__':
    app.run(debug=True)