from flask import Flask, render_template, redirect, url_for, request, session, flash, get_flashed_messages, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

app = Flask(__name__)
app.secret_key = '2163'

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
        cnx = get_db_connection()
        cursor = cnx.cursor(dictionary=True)
        cursor.execute('SELECT producto_id, cantidad FROM user_cart WHERE user_id = %s', (user_id,))
        productos_en_carrito = cursor.fetchall()
        cnx.close()
        session['cart'] = {str(producto['producto_id']): producto['cantidad'] for producto in productos_en_carrito}
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

@app.route('/')
def home():
    return render_template('index.html')

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
            flash('Sesión iniciada correctamente.', 'success')
            cnx.close()
            return redirect(url_for('profile'))
        cnx.close()
        flash('Usuario o contraseña incorrectos', 'danger')
        return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    if 'cart' in session:
        guardar_carrito_usuario(current_user.id, session['cart'])
    session.pop('cart', None)
    logout_user()
    flash('Has cerrado sesión.', 'info')
    return redirect(url_for('home'))

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user_id=current_user.id)

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
        cursor.execute('SELECT id, nombre, precio FROM productos')
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
    flash('Producto añadido al carrito con éxito.', 'success')
    return redirect(url_for('carrito'))

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
        return jsonify([])

    cart = session['cart']
    productos_con_cantidades = []

    # Conectar a la base de datos y obtener los productos
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    producto_ids = list(cart.keys())
    if producto_ids:
        cursor.execute('SELECT id, nombre, precio, stock FROM productos WHERE id IN (%s)' % ','.join(['%s'] * len(producto_ids)), producto_ids)
        productos = cursor.fetchall()

        for producto in productos:
            producto_id = producto['id']
            cantidad = cart.get(str(producto_id), 0)
            productos_con_cantidades.append({
                'id': producto['id'],
                'nombre': producto['nombre'],
                'precio': producto['precio'],
                'cantidad': cantidad,
                'stock': producto['stock']
            })

    conn.close()
    return jsonify(productos_con_cantidades)

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

    # Guardar el pedido en la tabla "pedidos"
    cursor.execute('INSERT INTO pedidos (user_id, total) VALUES (%s, %s)', (current_user.id, total))
    pedido_id = cursor.lastrowid

    # Guardar los detalles del pedido en la tabla "detalles_pedido"
    for producto_id, cantidad in session['cart'].items():
        cursor.execute('SELECT precio FROM productos WHERE id = %s', (producto_id,))
        producto = cursor.fetchone()
        if producto:
            cursor.execute('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio) VALUES (%s, %s, %s, %s)', 
                           (pedido_id, producto_id, cantidad, producto['precio']))

    conn.commit()

    # Vaciar el carrito después del pago
    session['cart'] = {}

    flash('Pago realizado con éxito. Gracias por tu compra.', 'success')
    return redirect(url_for('home'))

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

if __name__ == '__main__':
    app.run(debug=True)