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

@login_manager.user_loader
def load_user(user_id):
    user = User(user_id)
    if user.is_authenticated:
        session['cart'] = cargar_carrito_usuario(user_id)
        session.modified = True
    return user

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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT producto_id, cantidad FROM user_cart WHERE user_id = %s', (user_id,))
    carrito = {str(item['producto_id']): item['cantidad'] for item in cursor.fetchall()}
    cursor.close()
    conn.close()
    return carrito

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
    
    cursor.execute('SELECT id, password FROM usuarios WHERE username = %s', (username,))
    user = cursor.fetchone()
    
    if user and check_password_hash(user['password'], password):
        login_user(User(user['id']))
        
        # Cargar el carrito del usuario desde la base de datos
        session['cart'] = cargar_carrito_usuario(user['id'])
        session.modified = True  # Asegurar que Flask sepa que la sesión ha sido modificada

        cnx.close()
        return jsonify({'message': 'Sesión iniciada correctamente'})
    
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
    
    # Si el usuario está autenticado, guardamos el carrito en la base de datos
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

        # Si el usuario está autenticado, guardamos el carrito en la base de datos
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

def cargar_carrito_usuario(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT producto_id, cantidad FROM user_cart WHERE user_id = %s', (user_id,))
    carrito = {str(item['producto_id']): item['cantidad'] for item in cursor.fetchall()}
    cursor.close()
    conn.close()
    return carrito

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

        # Comprobamos si la cantidad es válida
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT stock FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        cnx.close()

        if producto:
            # Validamos que la nueva cantidad no supere el stock
            if nueva_cantidad <= producto['stock']:
                print(f'Actualizando producto {producto_id} a {nueva_cantidad} unidades')
                cart[str(producto_id)] = nueva_cantidad
                session['cart'] = cart  # Asegura que la sesión se actualiza

                # Si el usuario está autenticado, también actualizamos en la base de datos
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
    data = request.get_json()  # Asegúrate de que se está recibiendo JSON
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

@app.route('/checkout', methods=['POST'])
def checkout():
    if 'cart' not in session or not session['cart']:
        flash('El carrito está vacío. Añade productos antes de proceder al pago.', 'error')
        return redirect(url_for('carrito'))

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Calcular el total del carrito
    total = 0
    for producto_id, cantidad in session['cart'].items():
        cursor.execute('SELECT precio, stock FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        if producto:
            total += producto['precio'] * cantidad

            # Verificar si hay suficiente stock antes de proceder
            if producto['stock'] < cantidad:
                flash(f'No hay suficiente stock para {producto["nombre"]}.', 'error')
                return redirect(url_for('carrito'))

            # Reducir el stock del producto
            cursor.execute('UPDATE productos SET stock = stock - %s WHERE id = %s', (cantidad, producto_id))

    # Si el usuario está autenticado, guardamos el pedido en la base de datos
    if current_user.is_authenticated:
        cursor.execute('INSERT INTO pedidos (user_id, total) VALUES (%s, %s)', (current_user.id, total))
        pedido_id = cursor.lastrowid

        # Guardar los detalles del pedido en la tabla "detalles_pedido"
        for producto_id, cantidad in session['cart'].items():
            cursor.execute('SELECT precio FROM productos WHERE id = %s', (producto_id,))
            producto = cursor.fetchone()
            if producto:
                cursor.execute('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (%s, %s, %s, %s)',
                               (pedido_id, producto_id, cantidad, producto['precio']))
    else:
        # Para usuarios no autenticados, simplemente procesamos el pedido sin guardar en la base de datos
        flash('Pago realizado con éxito. Gracias por tu compra.', 'success')

    conn.commit()

    # Vaciar el carrito después del pago
    session['cart'] = {}

    return redirect(url_for('home'))

@app.route('/api/checkout', methods=['POST'])
def api_checkout():
    if 'cart' not in session or not session['cart']:
        return jsonify({'message': 'El carrito está vacío'}), 400

    cart = session['cart']
    total = 0
    cnx = get_db_connection()
    cursor = cnx.cursor(dictionary=True)

    # Calcular el total del carrito
    for producto_id, cantidad in cart.items():
        cursor.execute('SELECT precio, stock FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        if producto:
            if producto['stock'] < cantidad:
                return jsonify({'message': f"No hay suficiente stock para {producto['nombre']}."}), 400
            total += producto['precio'] * cantidad
            # Reducir el stock
            cursor.execute('UPDATE productos SET stock = stock - %s WHERE id = %s', (cantidad, producto_id))

    cnx.commit()
    cnx.close()

    # Vaciar el carrito después del pago
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


if __name__ == '__main__':
    app.run(debug=True)